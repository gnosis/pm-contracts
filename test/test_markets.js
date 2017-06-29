const { wait } = require('@digix/tempo')(web3)

const utils = require('./utils')

const Event = artifacts.require('Event')
const EventFactory = artifacts.require('EventFactory')
const Token = artifacts.require('Token')
const EtherToken = artifacts.require('EtherToken')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const Market = artifacts.require('Market')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const Campaign = artifacts.require('Campaign')
const CampaignFactory = artifacts.require('CampaignFactory')

contract('markets', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let standardMarketFactory
    let lmsrMarketMaker
    let campaignFactory
    let ipfsHash, centralizedOracle, event

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await EtherToken.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed()
        campaignFactory = await CampaignFactory.deployed()

        // create event
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        centralizedOracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )
        event = utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, centralizedOracle.address, 2),
            'categoricalEvent', Event
        )
    })

    it('should allow buying and selling', async () => {
        // create market
        const investor = 0

        const feeFactor = 50000  // 5%
        const market = utils.getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', Market
        )

        // Fund market
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf(accounts[investor]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })

        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf(accounts[investor]), 0)

        // Buy outcome tokens
        const buyer = 1
        const outcome = 0
        const token_count = 1e15
        const outcome_token_cost = await lmsrMarketMaker.calcCost(market.address, outcome, token_count)

        let fee = await market.calcMarketFee(outcome_token_cost)
        assert.equal(fee, Math.floor(outcome_token_cost * 5 / 100))

        const cost = fee.add(outcome_token_cost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), cost.valueOf())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(utils.getParamFromTxEvent(
            await market.buy(outcome, token_count, cost, { from: accounts[buyer] }), 'cost'
        ), cost.valueOf())

        const outcome_token = Token.at(await event.outcomeTokens(outcome))
        assert.equal(await outcome_token.balanceOf(accounts[buyer]), token_count)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), 0)

        // Sell outcome tokens
        const outcome_token_profit = await lmsrMarketMaker.calcProfit(market.address, outcome, token_count)
        fee = await market.calcMarketFee(outcome_token_profit)
        const profit = outcome_token_profit.sub(fee)

        await outcome_token.approve(market.address, token_count, { from: accounts[buyer] })
        assert.equal(utils.getParamFromTxEvent(
            await market.sell(outcome, token_count, profit, { from: accounts[buyer] }), 'profit'
        ), profit.valueOf())

        assert.equal(await outcome_token.balanceOf(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), profit.valueOf())
    })

    it('should support a campaign', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18
        const deadline = web3.eth.getBlock('latest').timestamp + 60  // in 1h
        const campaign = Campaign.at(utils.getParamFromTxEvent(
            await campaignFactory.createCampaigns(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding,
                deadline), 'campaign'))
        assert.equal(await campaign.stage(), 0)

        // Fund campaign
        const backer_1 = 2
        let amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer_1] })
        await etherToken.approve(campaign.address, amount, { from: accounts[backer_1] })
        await campaign.fund(amount, { from: accounts[backer_1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        const backer_2 = 3
        amount = 2.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer_2] })
        await etherToken.approve(campaign.address, amount, { from: accounts[backer_2] })
        campaign.fund(amount, { from: accounts[backer_2] })
        assert.equal(await campaign.stage(), 1)

        // Create market
        const market = Market.at(utils.getParamFromTxEvent(await campaign.createMarket(), 'market'))

        // Trade
        const buyer = 4
        const outcome = 0
        const token_count = 1e15
        const outcome_token_cost = await lmsrMarketMaker.calcCost(market.address, outcome, token_count)

        const fee = await market.calcMarketFee(outcome_token_cost)
        assert.equal(fee.valueOf(), outcome_token_cost.mul(.05).floor().valueOf())

        const cost = outcome_token_cost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf(accounts[buyer])).valueOf(), cost.valueOf())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(utils.getParamFromTxEvent(
            await market.buy(outcome, token_count, cost, { from: accounts[buyer] }), 'cost').valueOf()
        , cost.valueOf())

        // Set outcome
        await centralizedOracle.setOutcome(1)
        await event.setOutcome()

        // Withdraw fees
        await campaign.closeMarket()
        const final_balance = await campaign.finalBalance()

        assert.isAbove(final_balance, funding)

        assert.equal(
            utils.getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer_1] }),
                'fees'
            ).valueOf(), final_balance.mul(.75).floor().valueOf())
        assert.equal(
            utils.getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer_2] }),
                'fees'
            ).valueOf(), final_balance.mul(.25).floor().valueOf())

        // Withdraw works only once
        assert.equal(
            utils.getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer_1] }),
                'fees'
            ).valueOf(), 0)
        assert.equal(
            utils.getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer_2] }),
                'fees'
            ).valueOf(), 0)
    })

    it('can be created and closed', async () => {
        // Create market
        const buyer = 5

        const feeFactor = 0
        const market = utils.getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[buyer] }),
            'market', Market
        )

        // Fund market
        const funding = 100

        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[buyer] })
        await market.fund(funding, { from: accounts[buyer] })

        // Market can only be funded once
        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding)
        await etherToken.approve(market.address, funding, { from: accounts[buyer] })
        await utils.assertRejects(market.fund(funding, { from: accounts[buyer] }), 'market funded twice')

        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding)

        // Close market
        await market.close({ from: accounts[buyer] })

        // Market can only be closed once
        await utils.assertRejects(market.close({ from: accounts[buyer] }), 'market closed twice')

        // Sell all outcomes
        await event.sellAllOutcomes(funding, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding * 2)
    })

    it('support short selling', async () => {
        // create market
        const investor = 7

        const feeFactor = 50000  // 5%
        const market = utils.getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', Market
        )

        // Fund market
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal((await etherToken.balanceOf(accounts[investor])).valueOf(), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })

        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf(accounts[investor]), 0)

        // Short sell outcome tokens
        const buyer = 7
        const outcome = 0
        const opposite_outcome = 1
        const token_count = 1e15
        const outcome_token_profit = await lmsrMarketMaker.calcProfit(market.address, outcome, token_count)
        const fee = await market.calcMarketFee(outcome_token_profit)
        const cost = fee.add(token_count).sub(outcome_token_profit)

        await etherToken.deposit({ value: token_count, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), token_count)
        await etherToken.approve(market.address, token_count, { from: accounts[buyer] })

        assert.equal(
            utils.getParamFromTxEvent(
                await market.shortSell(outcome, token_count, outcome_token_profit - fee, { from: accounts[buyer] }),
                'cost', null, 'OutcomeTokenShortSale'
            ).valueOf(), cost)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), token_count - cost)
        const outcome_token = Token.at(await event.outcomeTokens(opposite_outcome))
        assert.equal(await outcome_token.balanceOf(accounts[buyer]), token_count)
    })

    it('support unsuccessful campaigns', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18
        const deadline = web3.eth.getBlock('latest').timestamp + 60  // in 1h
        const campaign = Campaign.at(utils.getParamFromTxEvent(
            await campaignFactory.createCampaigns(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding,
                deadline), 'campaign'))
        assert.equal(await campaign.stage(), 0)

        // Fund campaign
        const backer_1 = 8
        const amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer_1] })
        await etherToken.approve(campaign.address, amount, { from: accounts[backer_1] })
        await campaign.fund(amount, { from: accounts[backer_1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        // Deadline passes
        await wait(61)
        assert.equal(
            utils.getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer_1] }), 'refund'),
            amount)
        assert.equal(
            utils.getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer_1] }), 'refund'),
            0)
    })
})
