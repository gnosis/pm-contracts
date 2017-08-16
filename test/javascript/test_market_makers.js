const _ = require('lodash')

const { ONE, isClose, lmsrMarginalPrice, getParamFromTxEvent } = require('./utils')

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

    it('should move price of an outcome to 0 after participants sell lots of that outcome to market maker', async () => {
        // Create event
        const numOutcomes = 2
        const ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        const oracleAddress = getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle')
        const event = getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracleAddress, numOutcomes),
            'categoricalEvent', Event)

        // Create market
        const investor = 0

        const feeFactor = 0  // 0%
        const market = getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor,
                { from: accounts[investor] }),
            'market', Market)

        // Fund market
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
        const tokenCount = 1e18
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
            assert.equal(getParamFromTxEvent(
                await market.sell(outcome, tokenCount, profit, { from: accounts[trader] }), 'outcomeTokenProfit'
            ).valueOf(), profit.valueOf())

            let netOutcomeTokensSold = await Promise.all(_.range(numOutcomes).map((j) => market.netOutcomeTokensSold(j)))
            let expected = lmsrMarginalPrice(funding, netOutcomeTokensSold, outcome)
            let actual = (await lmsrMarketMaker.calcMarginalPrice(market.address, outcome)).div(ONE)
            assert(
                isClose(actual, expected),
                `Marginal price calculation is off for iteration ${i}:\n` +
                `        funding: ${funding}\n` +
                `        net outcome tokens sold: ${netOutcomeTokensSold}\n` +
                `        actual: ${actual}\n` +
                `        expected: ${expected}`
            )
        }
        // Selling of tokens is worth less than 1 Wei
        assert.equal(profit, 0)
        // User's Ether balance increased
        assert.isAbove(await etherToken.balanceOf(accounts[trader]), buyerBalance)
    })

    it('should move price of an outcome to 1 after participants buy lots of that outcome from market maker', async () => {
        for(let [investor, funding, tokenCount] of [
            [2, 1e17, 1e18],
            [3, 1, 10],
            [4, 1, 1e18],
        ]) {
            // Create event
            const numOutcomes = 2
            const ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
            const oracleAddress = getParamFromTxEvent(
                await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
                'centralizedOracle')
            const event = getParamFromTxEvent(
                await eventFactory.createCategoricalEvent(etherToken.address, oracleAddress, numOutcomes),
                'categoricalEvent', Event)

            // Create market
            const feeFactor = 0  // 0%
            const market = getParamFromTxEvent(
                await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor,
                    { from: accounts[investor] }),
                'market', Market)

            // Fund market
            await etherToken.deposit({ value: funding, from: accounts[investor] })
            assert.equal(await etherToken.balanceOf(accounts[investor]), funding)

            await etherToken.approve(market.address, funding, { from: accounts[investor] })
            await market.fund(funding, { from: accounts[investor] })
            assert.equal(await etherToken.balanceOf(accounts[investor]), 0)

            // User buys ether tokens
            const trader = 1
            const outcome = 1
            const loopCount = 10
            await etherToken.deposit({ value: tokenCount * loopCount, from: accounts[trader] })

            // User buys outcome tokens from market maker
            let cost
            for(let i of _.range(loopCount)) {
                // Calculate profit for selling tokens
                cost = await lmsrMarketMaker.calcCost(market.address, outcome, tokenCount)

                // Buying tokens
                await etherToken.approve(market.address, tokenCount, { from: accounts[trader] })
                assert.equal(getParamFromTxEvent(
                    await market.buy(outcome, tokenCount, cost, { from: accounts[trader] }), 'outcomeTokenCost'
                ).valueOf(), cost.valueOf())

                let netOutcomeTokensSold = await Promise.all(_.range(numOutcomes).map((j) => market.netOutcomeTokensSold(j)))
                let expected = lmsrMarginalPrice(funding, netOutcomeTokensSold, outcome)
                let actual = (await lmsrMarketMaker.calcMarginalPrice(market.address, outcome)).div(ONE)
                assert(
                    isClose(actual, expected) || expected.toString() == 'NaN',
                    `Marginal price calculation is off for iteration ${i}:\n` +
                    `        funding: ${funding}\n` +
                    `        net outcome tokens sold: ${netOutcomeTokensSold}\n` +
                    `        actual: ${actual}\n` +
                    `        expected: ${expected}`
                )
            }

            // Price is equal to 1
            assert.equal(cost, tokenCount)
        }
    })
})
