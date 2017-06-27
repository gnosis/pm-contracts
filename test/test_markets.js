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

contract('markets', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let standardMarketFactory
    let lmsrMarketMaker

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await EtherToken.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed()
    })

    it('should buy and sell all outcomes', async () => {
        // create event
        const ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        const oracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )
        const event = utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
            'categoricalEvent', Event
        )

        // create market
        const feeFactor = 50000  // 5%
        const market = utils.getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor),
            'market', Market
        )

        // Fund market
        const investor = 0
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
})
