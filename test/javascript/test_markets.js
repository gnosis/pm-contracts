const { wait } = require('@digix/tempo')(web3)

const utils = require('./utils')
const { getBlock, getParamFromTxEvent, assertRejects } = utils

const CategoricalEvent = artifacts.require('CategoricalEvent')
const EventFactory = artifacts.require('EventFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const EtherToken = artifacts.require('EtherToken')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const StandardMarket = artifacts.require('StandardMarket')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const Campaign = artifacts.require('Campaign')
const CampaignFactory = artifacts.require('CampaignFactory')

const contracts = [CategoricalEvent, EventFactory, OutcomeToken, EtherToken, CentralizedOracle, CentralizedOracleFactory, StandardMarket, StandardMarketFactory, LMSRMarketMaker, Campaign, CampaignFactory]

contract('StandardMarket', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let standardMarketFactory
    let lmsrMarketMaker
    let campaignFactory
    let ipfsHash, centralizedOracle, event
    const numOutcomes = 2

    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await EtherToken.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed.call()
        campaignFactory = await CampaignFactory.deployed()

        // create event
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        centralizedOracle = getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )
        event = getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, centralizedOracle.address, numOutcomes),
            'categoricalEvent', CategoricalEvent
        )
    })

    it('can be created and closed', async () => {
        // Create market
        const buyer = 5

        const feeFactor = 0
        const market = getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[buyer] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 100

        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[buyer] })
        await market.fund(funding, { from: accounts[buyer] })

        // StandardMarket can only be funded once
        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)
        await etherToken.approve(market.address, funding, { from: accounts[buyer] })
        await assertRejects(market.fund(funding, { from: accounts[buyer] }), 'market funded twice')

        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        // Close market
        await market.close({ from: accounts[buyer] })

        // StandardMarket can only be closed once
        await assertRejects(market.close({ from: accounts[buyer] }), 'market closed twice')

        // Sell all outcomes
        await event.sellAllOutcomes(funding, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding * 2)
    })

    it('should allow buying and selling', async () => {
        // create market
        const investor = 0

        const feeFactor = 50000  // 5%
        const market = getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })

        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Buy outcome tokens
        const buyer = 1
        const outcome = 0
        const tokenCount = 1e15
        let outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)

        let fee = await market.calcMarketFee.call(outcomeTokenCost)
        assert.equal(fee, Math.floor(outcomeTokenCost * 5 / 100))

        const cost = fee.add(outcomeTokenCost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.valueOf())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await market.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        ), outcomeTokenCost.valueOf())

        const outcomeToken = OutcomeToken.at(await event.outcomeTokens.call(outcome))
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        // Sell outcome tokens
        outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? -tokenCount : 0)
        const outcomeTokenProfit = (await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)).neg()
        fee = await market.calcMarketFee.call(outcomeTokenProfit)
        const profit = outcomeTokenProfit.sub(fee)

        await outcomeToken.approve(market.address, tokenCount, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await market.trade(outcomeTokenAmounts, -profit, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        ).neg().valueOf(), outcomeTokenProfit.valueOf())

        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), profit.valueOf())
    })

    it('should allow short selling', async () => {
        // create market
        const investor = 7

        const feeFactor = 50000  // 5%
        const market = getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal((await etherToken.balanceOf.call(accounts[investor])).valueOf(), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })

        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Short sell outcome tokens
        const buyer = 7
        const outcome = 0
        const differentOutcome = 1
        const tokenCount = 1e15
        const outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i !== outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)
        const fee = await market.calcMarketFee.call(outcomeTokenCost)
        const cost = outcomeTokenCost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.valueOf())
        await etherToken.approve(market.address, cost, { from: accounts[buyer] })

        assert.equal(
            getParamFromTxEvent(
                await market.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }),
                'outcomeTokenNetCost'
            ).valueOf(), outcomeTokenCost.valueOf())
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)
        const outcomeToken = OutcomeToken.at(await event.outcomeTokens.call(differentOutcome))
                'cost', null, 'OutcomeTokenShortSale'
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
    })

    it('should be created by a successful campaign', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18
        const deadline = (await getBlock('latest')).timestamp + 60  // in 1h
        const campaign = Campaign.at(getParamFromTxEvent(
            await campaignFactory.createCampaign(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding,
                deadline), 'campaign'))
        assert.equal(await campaign.stage.call(), 0)

        // Fund campaign
        const backer1 = 2
        let amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer1] })
        await etherToken.approve(campaign.address, amount, { from: accounts[backer1] })
        await campaign.fund(amount, { from: accounts[backer1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        const backer2 = 3
        amount = 2.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer2] })
        await etherToken.approve(campaign.address, amount, { from: accounts[backer2] })
        campaign.fund(amount, { from: accounts[backer2] })
        assert.equal(await campaign.stage.call(), 1)

        // Create market
        const market = StandardMarket.at(getParamFromTxEvent(await campaign.createMarket(), 'market'))

        // Trade
        const buyer = 4
        const outcome = 0
        const tokenCount = 1e15
        const outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)

        const fee = await market.calcMarketFee.call(outcomeTokenCost)
        assert.equal(fee.valueOf(), outcomeTokenCost.mul(.05).floor().valueOf())

        const cost = outcomeTokenCost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf.call(accounts[buyer])).valueOf(), cost.valueOf())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await market.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }), 'outcomeTokenNetCost').valueOf()
        , outcomeTokenCost.valueOf())

        // Set outcome
        await centralizedOracle.setOutcome(1)
        await event.setOutcome()

        // Withdraw fees
        await campaign.closeMarket()
        const finalBalance = await campaign.finalBalance()

        assert.isAbove(finalBalance, funding)

        assert.equal(
            getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer1] }),
                'fees'
            ).valueOf(), finalBalance.mul(.75).floor().valueOf())
        assert.equal(
            getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer2] }),
                'fees'
            ).valueOf(), finalBalance.mul(.25).floor().valueOf())

        // Withdraw works only once
        assert.equal(
            getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer1] }),
                'fees'
            ).valueOf(), 0)
        assert.equal(
            getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer2] }),
                'fees'
            ).valueOf(), 0)
    })

    it('should not be created by an unsuccessful campaign', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18
        const deadline = (await getBlock('latest')).timestamp + 60  // in 1h
        const campaign = Campaign.at(getParamFromTxEvent(
            await campaignFactory.createCampaign(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding,
                deadline), 'campaign'))
        assert.equal(await campaign.stage.call(), 0)

        // Fund campaign
        const backer1 = 8
        const amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer1] })
        await etherToken.approve(campaign.address, amount, { from: accounts[backer1] })
        await campaign.fund(amount, { from: accounts[backer1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        // Deadline passes
        await wait(61)
        assert.equal(
            getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer1] }), 'refund'),
            amount)
        assert.equal(
            getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer1] }), 'refund'),
            0)
    })
})
