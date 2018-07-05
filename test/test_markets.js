const NewWeb3 = require('web3')
const { wait } = require('@digix/tempo')(web3)

const utils = require('./utils')
const { getBlock, getParamFromTxEvent, assertRejects, Decimal, randnums } = utils

const CategoricalEvent = artifacts.require('CategoricalEvent')
const EventFactory = artifacts.require('EventFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')
const StandardMarket = artifacts.require('StandardMarket')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const Campaign = artifacts.require('Campaign')
const CampaignFactory = artifacts.require('CampaignFactory')

const contracts = [CategoricalEvent, EventFactory, OutcomeToken, WETH9, StandardMarket, StandardMarketFactory, LMSRMarketMaker, Campaign, CampaignFactory]

contract('StandardMarket', function (accounts) {
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
        eventFactory = await EventFactory.deployed()
        etherToken = await WETH9.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed.call()
        campaignFactory = await CampaignFactory.deployed()

        // create event
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        centralizedOracle = accounts[1]
        event = getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, centralizedOracle, numOutcomes),
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
        await event.receiveResult('0x0', NewWeb3.utils.padLeft('0x1', 64), {from: centralizedOracle})

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

    it('trading stress testing', async () => {
        const MAX_VALUE = Decimal(2).pow(256).sub(1)

        const trader = 9
        const feeFactor = 0

        const market = getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[trader] }),
            'market', StandardMarket
        )

        // Get ready for trading
        await etherToken.deposit({ value: 2e19, from: accounts[trader] })
        await etherToken.approve(event.address, 1e19, { from: accounts[trader] })
        await event.buyAllOutcomes(1e19, { from: accounts[trader] })

        // Allow all trading
        const outcomeTokens = (await Promise.all(
            _.range(numOutcomes).map(i => event.outcomeTokens.call(i))
        )).map(OutcomeToken.at)

        await etherToken.approve(market.address, MAX_VALUE.valueOf(), { from: accounts[trader] })
        await Promise.all(outcomeTokens.map(outcomeToken =>
            outcomeToken.approve(market.address, MAX_VALUE.valueOf(), { from: accounts[trader] })))

        // Fund market
        const funding = 1e16
        await market.fund(funding, { from: accounts[trader] })

        for(let i = 0; i < 100; i++) {
            const outcomeTokenAmounts = randnums(-1e16, 1e16, numOutcomes).map(n => n.valueOf())
            const netCost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)

            const marketOutcomeTokenCounts = await Promise.all(outcomeTokens.map(outcomeToken =>
                outcomeToken.balanceOf.call(market.address)))

            const marketCollateralTokenCount = await etherToken.balanceOf.call(market.address)

            let txResult;
            try {
                txResult = await market.trade(outcomeTokenAmounts, netCost, { from: accounts[trader] })
            } catch(e) {
                throw new Error(`trade ${ i } with input ${
                    outcomeTokenAmounts
                } and limit ${
                    netCost
                } failed while market has:\n\n${
                    marketOutcomeTokenCounts.map(c => c.valueOf()).join('\n')
                }\n\nand ${
                    marketCollateralTokenCount.valueOf()
                }: ${
                    e.message
                }`)
            }

            if(txResult)
                assert.equal(
                    getParamFromTxEvent(txResult, 'outcomeTokenNetCost').valueOf(),
                    netCost.valueOf())
        }
    })
})
