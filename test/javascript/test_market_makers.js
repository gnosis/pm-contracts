const _ = require('lodash')

const utils = require('./utils')
const { ONE, isClose, lmsrMarginalPrice, getParamFromTxEvent } = utils

const EventFactory = artifacts.require('EventFactory')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const EtherToken = artifacts.require('EtherToken')
const OutcomeToken = artifacts.require('OutcomeToken')
const StandardMarket = artifacts.require('StandardMarket')
const CategoricalEvent = artifacts.require('CategoricalEvent')

const contracts = [EventFactory, CentralizedOracleFactory, StandardMarketFactory, LMSRMarketMaker, EtherToken, OutcomeToken, StandardMarket, CategoricalEvent]

contract('MarketMaker', function(accounts) {
    let eventFactory
    let centralizedOracleFactory
    let standardMarketFactory
    let lmsrMarketMaker
    let etherToken

    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        eventFactory = await EventFactory.deployed()
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed.call()
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
            'categoricalEvent', CategoricalEvent)

        // Create market
        const investor = 0

        const feeFactor = 0  // 0%
        const market = getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor,
                { from: accounts[investor] }),
            'market', StandardMarket)

        // Fund market
        const funding = 1e17

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })
        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // User buys all outcomes
        const trader = 1
        const outcome = 1
        const outcomeToken = OutcomeToken.at(await event.outcomeTokens.call(outcome))
        const tokenCount = 1e18
        const loopCount = 10

        await etherToken.deposit({ value: tokenCount * loopCount, from: accounts[trader] })
        await etherToken.approve(event.address, tokenCount * loopCount, { from: accounts[trader] })
        await event.buyAllOutcomes(tokenCount * loopCount, { from: accounts[trader] })

        // User sells tokens
        const buyerBalance = await etherToken.balanceOf.call(accounts[trader])
        let profit, outcomeTokenAmounts
        for(let i of _.range(loopCount)) {
            // Calculate profit for selling tokens
            outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? -tokenCount : 0)
            profit = (await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)).neg()
            if(profit == 0)
                break

            // Selling tokens
            await outcomeToken.approve(market.address, tokenCount, { from: accounts[trader] })
            assert.equal(getParamFromTxEvent(
                await market.trade(outcomeTokenAmounts, profit.neg(), { from: accounts[trader] }), 'outcomeTokenNetCost'
            ).neg().valueOf(), profit.valueOf())

            let netOutcomeTokensSold = await Promise.all(_.range(numOutcomes).map((j) => market.netOutcomeTokensSold(j)))
            let expected = lmsrMarginalPrice(funding, netOutcomeTokensSold, outcome)
            let actual = (await lmsrMarketMaker.calcMarginalPrice.call(market.address, outcome)).div(ONE)
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
        assert.isAbove(await etherToken.balanceOf.call(accounts[trader]), buyerBalance)
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
                'categoricalEvent', CategoricalEvent)

            // Create market
            const feeFactor = 0  // 0%
            const market = getParamFromTxEvent(
                await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor,
                    { from: accounts[investor] }),
                'market', StandardMarket)

            // Fund market
            await etherToken.deposit({ value: funding, from: accounts[investor] })
            assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

            await etherToken.approve(market.address, funding, { from: accounts[investor] })
            await market.fund(funding, { from: accounts[investor] })
            assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

            // User buys ether tokens
            const trader = 1
            const outcome = 1
            const loopCount = 10
            await etherToken.deposit({ value: tokenCount * loopCount, from: accounts[trader] })

            // User buys outcome tokens from market maker
            let cost, outcomeTokenAmounts
            for(let i of _.range(loopCount)) {
                // Calculate cost of buying tokens
                outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
                cost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)

                // Buying tokens
                await etherToken.approve(market.address, tokenCount, { from: accounts[trader] })
                assert.equal(getParamFromTxEvent(
                    await market.trade(outcomeTokenAmounts, cost, { from: accounts[trader] }), 'outcomeTokenNetCost'
                ).valueOf(), cost.valueOf())

                let netOutcomeTokensSold = await Promise.all(_.range(numOutcomes).map((j) => market.netOutcomeTokensSold(j)))
                let expected = lmsrMarginalPrice(funding, netOutcomeTokensSold, outcome)
                let actual = (await lmsrMarketMaker.calcMarginalPrice.call(market.address, outcome)).div(ONE)
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

    it('should allow buying and selling outcome tokens in the same transaction', async () => {
        // Create event
        const numOutcomes = 4
        const ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        const oracleAddress = getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle')
        const event = getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracleAddress, numOutcomes),
            'categoricalEvent', CategoricalEvent)

        // Create market
        const investor = 5

        const feeFactor = 0  // 0%
        const market = getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor,
                { from: accounts[investor] }),
            'market', StandardMarket)

        // Fund market
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })
        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        const trader = 6
        const initialOutcomeTokenCount = 1e18
        const initialEtherTokenCount = 10e18

        // User buys all outcomes
        await etherToken.deposit({ value: initialOutcomeTokenCount + initialEtherTokenCount, from: accounts[trader] })
        await etherToken.approve(event.address, initialOutcomeTokenCount, { from: accounts[trader] })
        await event.buyAllOutcomes(initialOutcomeTokenCount, { from: accounts[trader] })

        // User trades with the market
        const tradeValues = [5e17, -1e18, -1e17, 2e18]
        const cost = await lmsrMarketMaker.calcNetCost.call(market.address, tradeValues)
        if(cost.gt(0)) await etherToken.approve(market.address, cost, { from: accounts[trader] })

        const outcomeTokens = await Promise.all(_.range(numOutcomes).map(i => event.outcomeTokens.call(i).then(tokenAddr => OutcomeToken.at(tokenAddr))))
        await Promise.all(tradeValues.map((v, i) => [v, i]).filter(([v]) => v < 0).map(([v, i]) =>
            outcomeTokens[i].approve(market.address, -v, { from: accounts[trader] })))

        assert.equal(getParamFromTxEvent(
            await market.trade(tradeValues, cost, { from: accounts[trader] }), 'outcomeTokenNetCost'
        ), cost.valueOf())

        // All state transitions associated with trade have been performed
        for(let [tradeValue, i] of tradeValues.map((v, i) => [v, i])) {
            assert.equal(await outcomeTokens[i].balanceOf.call(accounts[trader]), initialOutcomeTokenCount + tradeValue)
        }

        assert.equal(await etherToken.balanceOf.call(accounts[trader]), initialEtherTokenCount - cost.valueOf())
    })
})
