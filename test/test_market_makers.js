const _ = require('lodash')

const utils = require('./utils')
const { ONE, isClose, lmsrMarginalPrice } = utils

const EventFactory = artifacts.require('EventFactory')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const EtherToken = artifacts.require('EtherToken')
const Token = artifacts.require('Token')
const Market = artifacts.require('Market')
const Event = artifacts.require('Event')

contract('MarketMaker', function(accounts) {
    let eventFactory
    let centralizedOracleFactory
    let standardMarketFactory
    let lmsrMarketMaker
    let etherToken

    beforeEach(async () => {
        eventFactory = await EventFactory.deployed()
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed()
        etherToken = await EtherToken.deployed()
    })

    // @staticmethod
    // def calc_cost(funding, netOutcomeTokensSold, outcome, outcomeTokenCount):
    //     b = mpf(funding) / mp.log(len(netOutcomeTokensSold))
    //     return b * (
    //         mp.log(sum(
    //             mp.exp((tokens_sold + (outcomeTokenCount if i == outcome else 0)) / b)
    //             for i, tokens_sold in enumerate(netOutcomeTokensSold)
    //         )) -
    //         mp.log(sum(
    //             mp.exp(tokens_sold / b)
    //             for tokens_sold in netOutcomeTokensSold
    //         ))
    //     )

    it('should calculate outcome token cost', async () => {

    })
    // def test(self):
    //     for funding, outcomeTokenCount in [
    //         (10*10**18, 5 * 10 ** 18),
    //         (10, 5),
    //         (10*10**18, 5000),
    //         (10*10**18, 5),
    //         (10, 5 * 10 ** 18),
    //     ]:
    //         ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
    //         // Create event
    //         ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
    //         oracleAddress = await centralizedOracleFactory.createCentralizedOracle(ipfsHash)
    //         event = Event.at(await eventFactory.createCategoricalEvent(ether_token.address, oracleAddress, 2))
    //         // Create market
    //         fee = 50000  // 5%
    //         market = Market.at(await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, fee))
    //         // Fund market
    //         investor = 0
    //         ether_token.deposit({ value: funding, from: accounts[investor] })
    //         assert.equal(ether_token.balanceOf(accounts[investor]), funding)
    //         ether_token.approve(market.address, funding, { from: accounts[investor] })
    //         await market.fund(funding, { from: accounts[investor] })
    //         assert.equal(ether_token.balanceOf(accounts[investor]), 0)
    //         // Calculating cost for buying shares and earnings for selling shares
    //         outcome = 1
    //         actual = await lmsrMarketMaker.calcCost(market.address, outcome, outcomeTokenCount)
    //         expected = self.calc_cost(funding, [0, 0], outcome, outcomeTokenCount)
    //         assert (
    //             (funding, outcomeTokenCount) is not None and
    //             isclose(actual, mp.ceil(expected), abs_tol=1)
    //         )

    it('should move price of an outcome to 0 after participants sell lots of that outcome to market maker', async () => {
        // Create event
        const numOutcomes = 2
        const ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        const oracleAddress = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle')
        const event = utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracleAddress, numOutcomes),
            'categoricalEvent', Event)

        // Create market
        const feeFactor = 0  // 0%
        const market = utils.getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor),
            'market', Market)

        // Fund market
        const investor = 0
        const funding = 1e17

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf(accounts[investor]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })
        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf(accounts[investor]), 0)

        // User buys all outcomes
        const trader = 1
        const outcome = 1
        const outcomeToken = Token.at(await event.outcomeTokens(outcome))
        const tokenCount = 1e18  // 100 Ether
        const loopCount = 10

        await etherToken.deposit({ value: tokenCount * loopCount, from: accounts[trader] })
        await etherToken.approve(event.address, tokenCount * loopCount, { from: accounts[trader] })
        await event.buyAllOutcomes(tokenCount * loopCount, { from: accounts[trader] })

        // User sells tokens
        const buyerBalance = await etherToken.balanceOf(accounts[trader])
        let profit
        for(let i of _.range(loopCount)) {
            // Calculate profit for selling tokens
            profit = await lmsrMarketMaker.calcProfit(market.address, outcome, tokenCount)
            if(profit == 0)
                break

            // Selling tokens
            await outcomeToken.approve(market.address, tokenCount, { from: accounts[trader] })
            assert.equal(utils.getParamFromTxEvent(
                await market.sell(outcome, tokenCount, profit, { from: accounts[trader] }), 'profit'
            ).valueOf(), profit.valueOf())

            netOutcomeTokensSold = await Promise.all(_.range(numOutcomes).map((j) => market.netOutcomeTokensSold(j)))
            expected = lmsrMarginalPrice(funding, netOutcomeTokensSold, outcome)
            actual = (await lmsrMarketMaker.calcMarginalPrice(market.address, outcome)).div(ONE)
            assert(
                isClose(actual, expected),
                `Marginal price calculation is off for iteration ${i}`
            )
        }
        // Selling of tokens is worth less than 1 Wei
        assert.equal(profit, 0)
        // User's Ether balance increased
        assert.isAbove(await etherToken.balanceOf(accounts[trader]), buyerBalance)
    })

    it('should move price of an outcome to 1 after participants buy lots of that outcome from market maker', async () => {

    })
    // def test(self):
    //     for funding, tokenCount in [
    //         (10*10**18, 100 * 10 ** 18),
    //         (1, 10),
    //         (10**20, 10 ** 21),
    //         (1, 10 ** 21),
    //     ]:
    //         ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
    //         // Create event
    //         numOutcomes = 2
    //         ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
    //         oracleAddress = await centralizedOracleFactory.createCentralizedOracle(ipfsHash)
    //         event = Event.at(await eventFactory.createCategoricalEvent(ether_token.address, oracleAddress, numOutcomes))
    //         // Create market
    //         fee = 0  // 0%
    //         market = Market.at(await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, fee))
    //         // Fund market
    //         investor = 0
    //         ether_token.deposit({ value: funding, from: accounts[investor] })
    //         assert.equal(ether_token.balanceOf(accounts[investor]), funding)
    //         ether_token.approve(market.address, funding, { from: accounts[investor] })
    //         await market.fund(funding, { from: accounts[investor] })
    //         assert.equal(ether_token.balanceOf(accounts[investor]), 0)
    //         // User buys ether tokens
    //         trader = 1
    //         outcome = 1
    //         loopCount = 10
    //         ether_token.deposit({ value: tokenCount * loopCount, from: accounts[trader] })
    //         // User buys outcome tokens from market maker
    //         cost = None
    //         for(let i of _.range(loopCount))
    //             // Calculate profit for selling tokens
    //             cost = await lmsrMarketMaker.calcCost(market.address, outcome, tokenCount)
    //             // Buying tokens
    //             ether_token.approve(market.address, tokenCount, { from: accounts[trader] })
    //             assert.equal(await market.buy(outcome, tokenCount, cost, { from: accounts[trader] }), cost)
    //             netOutcomeTokensSold = [await market.netOutcomeTokensSold(i) for i in _.range(numOutcomes)]
    //             expected = lmsr_marginal_price(funding, netOutcomeTokensSold, outcome)
    //             actual = mpf(await lmsrMarketMaker.calcMarginalPrice(market.address, outcome)) / ONE
    //             assert (i, funding, netOutcomeTokensSold) and isclose(expected, actual)

    //         // Price is equal to 1
    //         assert.equal(cost, tokenCount)
})
