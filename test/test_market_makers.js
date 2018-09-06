const _ = require('lodash')
const testGas = require('@gnosis.pm/truffle-nice-tools').testGas
const NewWeb3 = require('web3')
const { wait } = require('@digix/tempo')(web3)

const utils = require('./utils')
const { ONE, isClose, lmsrMarginalPrice, getParamFromTxEvent, getBlock, assertRejects, Decimal, randnums } = utils

const EventManager = artifacts.require('EventManager')
const EventManagerFactory = artifacts.require('EventManagerFactory')
const LMSRMarketMakerFactory = artifacts.require('LMSRMarketMakerFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const WETH9 = artifacts.require('WETH9')
const OutcomeToken = artifacts.require('OutcomeToken')

const contracts = [EventManager, EventManagerFactory, LMSRMarketMakerFactory, LMSRMarketMaker, WETH9, OutcomeToken]

contract('MarketMaker', function(accounts) {
    let eventManagerFactory
    let lmsrMarketMakerFactory
    let etherToken

    before(testGas.createGasStatCollectorBeforeHook(contracts))
    after(testGas.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        eventManagerFactory = await EventManagerFactory.deployed()
        lmsrMarketMakerFactory = await LMSRMarketMakerFactory.deployed()
        etherToken = await WETH9.deployed()
    })

    it.skip('should move price of an outcome to 0 after participants sell lots of that outcome to lmsrMarketMaker maker', async () => {
        // Create event
        const numOutcomes = 2
        const questionId = '0xf00dcafef00dcafef00dcafef00dcafef00dcafef00dcafef00dcafef00dcafe'
        const oracleAddress = accounts[1]
        const eventManager = getParamFromTxEvent(
            await eventManagerFactory.createEventManager(etherToken.address),
            'eventManager', EventManager)

        // Create lmsrMarketMaker
        const investor = 0

        const feeFactor = 0  // 0%
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(eventManager.address, outcomeTokenSetId, feeFactor,
                { from: accounts[investor] }),
            'lmsrMarketMaker', LMSRMarketMaker)

        // Fund lmsrMarketMaker
        const funding = 1e17

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[investor] })
        await lmsrMarketMaker.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // User buys all outcomes
        const trader = 1
        const outcome = 1
        const outcomeToken = OutcomeToken.at(await eventManager.outcomeTokens.call(outcomeTokenSetId, outcome))
        const tokenCount = 1e18
        const loopCount = 10

        await etherToken.deposit({ value: tokenCount * loopCount, from: accounts[trader] })
        await etherToken.approve(eventManager.address, tokenCount * loopCount, { from: accounts[trader] })
        await eventManager.mintOutcomeTokenSet(outcomeTokenSetId, tokenCount * loopCount, { from: accounts[trader] })

        // User sells tokens
        const buyerBalance = await etherToken.balanceOf.call(accounts[trader])
        let profit, outcomeTokenAmounts
        for(let i of _.range(loopCount)) {
            // Calculate profit for selling tokens
            outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? -tokenCount : 0)
            profit = (await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)).neg()
            if(profit == 0)
                break

            // Selling tokens
            await outcomeToken.approve(lmsrMarketMaker.address, tokenCount, { from: accounts[trader] })
            assert.equal(getParamFromTxEvent(
                await lmsrMarketMaker.trade(outcomeTokenAmounts, profit.neg(), { from: accounts[trader] }), 'outcomeTokenNetCost'
            ).neg().valueOf(), profit.valueOf())

            let netOutcomeTokensSold = await Promise.all(_.range(numOutcomes).map((j) => lmsrMarketMaker.netOutcomeTokensSold(j)))
            let expected = lmsrMarginalPrice(funding, netOutcomeTokensSold, outcome)
            let actual = (await lmsrMarketMaker.calcMarginalPrice.call(outcome)).div(ONE)
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

    it.skip('should move price of an outcome to 1 after participants buy lots of that outcome from lmsrMarketMaker maker', async () => {
        for(let [investor, funding, tokenCount] of [
            [2, 1e17, 1e18],
            [3, 1, 10],
            [4, 1, 1e18],
        ]) {
            // Create event
            const numOutcomes = 2
            const questionId = '0xf00dcafef00dcafef00dcafef00dcafef00dcafef00dcafef00dcafef00dcafe'
            const oracleAddress = accounts[5]
            const event = getParamFromTxEvent(
                await eventManagerFactory.createCategoricalEvent(etherToken.address, oracleAddress, numOutcomes),
                'categoricalEvent', CategoricalEvent)

            // Create lmsrMarketMaker
            const feeFactor = 0  // 0%
            const lmsrMarketMaker = getParamFromTxEvent(
                await lmsrMarketMakerFactory.createLMSRMarketMaker(eventManager.address, outcomeTokenSetId, feeFactor,
                    { from: accounts[investor] }),
                'lmsrMarketMaker', LMSRMarketMaker)

            // Fund lmsrMarketMaker
            await etherToken.deposit({ value: funding, from: accounts[investor] })
            assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

            await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[investor] })
            await lmsrMarketMaker.fund(funding, { from: accounts[investor] })
            assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

            // User buys ether tokens
            const trader = 1
            const outcome = 1
            const loopCount = 10
            await etherToken.deposit({ value: tokenCount * loopCount, from: accounts[trader] })

            // User buys outcome tokens from lmsrMarketMaker maker
            let cost, outcomeTokenAmounts
            for(let i of _.range(loopCount)) {
                // Calculate cost of buying tokens
                outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
                cost = await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)

                // Buying tokens
                await etherToken.approve(lmsrMarketMaker.address, tokenCount, { from: accounts[trader] })
                assert.equal(getParamFromTxEvent(
                    await lmsrMarketMaker.trade(outcomeTokenAmounts, cost, { from: accounts[trader] }), 'outcomeTokenNetCost'
                ).valueOf(), cost.valueOf())

                let netOutcomeTokensSold = await Promise.all(_.range(numOutcomes).map((j) => lmsrMarketMaker.netOutcomeTokensSold(j)))
                let expected = lmsrMarginalPrice(funding, netOutcomeTokensSold, outcome)
                let actual = (await lmsrMarketMaker.calcMarginalPrice.call(outcome)).div(ONE)
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
        const questionId = '0xf00dcafef00dcafef00dcafef00dcafef00dcafef00dcafef00dcafef00dcafe'
        const oracleAddress = accounts[1]
        const eventManager = getParamFromTxEvent(
            await eventManagerFactory.createEventManager(etherToken.address),
            'eventManager', EventManager)
        const outcomeTokenSetId = getParamFromTxEvent(
            await eventManager.prepareEvent(oracleAddress, questionId, numOutcomes),
            'outcomeTokenSetId')

        // Create lmsrMarketMaker
        const investor = 5

        const feeFactor = 0  // 0%
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(eventManager.address, outcomeTokenSetId, feeFactor,
                { from: accounts[investor] }),
            'lmsrMarketMaker', LMSRMarketMaker)

        // Fund lmsrMarketMaker
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[investor] })
        await lmsrMarketMaker.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        const trader = 6
        const initialOutcomeTokenCount = 1e18
        const initialWETH9Count = 10e18

        // User buys all outcomes
        await etherToken.deposit({ value: initialOutcomeTokenCount + initialWETH9Count, from: accounts[trader] })
        await etherToken.approve(eventManager.address, initialOutcomeTokenCount, { from: accounts[trader] })
        await eventManager.mintOutcomeTokenSet(outcomeTokenSetId, initialOutcomeTokenCount, { from: accounts[trader] })

        // User trades with the lmsrMarketMaker maker
        const tradeValues = [5e17, -1e18, -1e17, 2e18]
        const cost = await lmsrMarketMaker.calcNetCost.call(tradeValues)
        if(cost.gt(0)) await etherToken.approve(lmsrMarketMaker.address, cost, { from: accounts[trader] })

        const outcomeTokens = await Promise.all(_.range(numOutcomes).map(i => eventManager.outcomeTokens.call(outcomeTokenSetId, i).then(tokenAddr => OutcomeToken.at(tokenAddr))))
        await Promise.all(tradeValues.map((v, i) => [v, i]).filter(([v]) => v < 0).map(([v, i]) =>
            outcomeTokens[i].approve(lmsrMarketMaker.address, -v, { from: accounts[trader] })))

        assert.equal(getParamFromTxEvent(
            await lmsrMarketMaker.trade(tradeValues, cost, { from: accounts[trader] }), 'outcomeTokenNetCost'
        ), cost.valueOf())

        // All state transitions associated with trade have been performed
        for(let [tradeValue, i] of tradeValues.map((v, i) => [v, i])) {
            assert.equal(await outcomeTokens[i].balanceOf.call(accounts[trader]), initialOutcomeTokenCount + tradeValue)
        }

        assert.equal(await etherToken.balanceOf.call(accounts[trader]), initialWETH9Count - cost.valueOf())
    })
})


contract('LMSRMarketMaker', function (accounts) {
    let eventManagerFactory
    let etherToken
    let lmsrMarketMakerFactory
    let questionId = 100, centralizedOracle, eventManager, outcomeTokenSetId
    const numOutcomes = 2

    before(testGas.createGasStatCollectorBeforeHook(contracts))
    after(testGas.createGasStatCollectorAfterHook(contracts))

    before(async () => {
        eventManagerFactory = await EventManagerFactory.deployed()
        etherToken = await WETH9.deployed()
        lmsrMarketMakerFactory = await LMSRMarketMakerFactory.deployed()
        eventManager = getParamFromTxEvent(
            await eventManagerFactory.createEventManager(etherToken.address),
            'eventManager', EventManager
        )
    })

    beforeEach(async () => {
        // create event
        centralizedOracle = accounts[1]
        questionId++
        outcomeTokenSetId = getParamFromTxEvent(
            await eventManager.prepareEvent(centralizedOracle, questionId, numOutcomes),
            'outcomeTokenSetId')
    })

    it('can be created and closed', async () => {
        // Create lmsrMarketMaker
        const buyer = 5

        const feeFactor = 0
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(eventManager.address, outcomeTokenSetId, feeFactor, { from: accounts[buyer] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Fund lmsrMarketMaker
        const funding = 100

        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[buyer] })
        await lmsrMarketMaker.fund(funding, { from: accounts[buyer] })

        // LMSRMarketMaker can only be funded once
        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)
        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[buyer] })
        await assertRejects(lmsrMarketMaker.fund(funding, { from: accounts[buyer] }), 'lmsrMarketMaker funded twice')

        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        // Close lmsrMarketMaker
        await lmsrMarketMaker.close({ from: accounts[buyer] })

        // LMSRMarketMaker can only be closed once
        await assertRejects(lmsrMarketMaker.close({ from: accounts[buyer] }), 'lmsrMarketMaker closed twice')

        // Sell all outcomes
        const outcomeTokens = (await Promise.all(
            _.range(numOutcomes).map(i => eventManager.outcomeTokens.call(outcomeTokenSetId, i))
        )).map(OutcomeToken.at)
        await Promise.all(outcomeTokens.map(ot => ot.approve(eventManager.address, funding, { from: accounts[buyer] })))
        await eventManager.burnOutcomeTokenSet(outcomeTokenSetId, funding, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding * 2)
    })

    it('should allow buying and selling', async () => {
        // create lmsrMarketMaker
        const investor = 0

        const feeFactor = 5e16  // 5%
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(eventManager.address, outcomeTokenSetId, feeFactor, { from: accounts[investor] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Fund lmsrMarketMaker
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[investor] })

        await lmsrMarketMaker.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Buy outcome tokens
        const buyer = 1
        const outcome = 0
        const tokenCount = 1e15
        let outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)

        let fee = await lmsrMarketMaker.calcMarketFee.call(outcomeTokenCost)
        assert.equal(fee, Math.floor(outcomeTokenCost * 5 / 100))

        const cost = fee.add(outcomeTokenCost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.valueOf())

        await etherToken.approve(lmsrMarketMaker.address, cost, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await lmsrMarketMaker.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        ), outcomeTokenCost.valueOf())

        const outcomeToken = OutcomeToken.at(await eventManager.outcomeTokens.call(outcomeTokenSetId, outcome))
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        // Sell outcome tokens
        outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? -tokenCount : 0)
        const outcomeTokenProfit = (await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)).neg()
        fee = await lmsrMarketMaker.calcMarketFee.call(outcomeTokenProfit)
        const profit = outcomeTokenProfit.sub(fee)

        await outcomeToken.approve(lmsrMarketMaker.address, tokenCount, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await lmsrMarketMaker.trade(outcomeTokenAmounts, -profit, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        ).neg().valueOf(), outcomeTokenProfit.valueOf())

        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), profit.valueOf())
    })

    it('should allow short selling', async () => {
        // create lmsrMarketMaker
        const investor = 7

        const feeFactor = 50000  // 5%
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(eventManager.address, outcomeTokenSetId, feeFactor, { from: accounts[investor] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Fund lmsrMarketMaker
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal((await etherToken.balanceOf.call(accounts[investor])).valueOf(), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[investor] })

        await lmsrMarketMaker.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Short sell outcome tokens
        const buyer = 7
        const outcome = 0
        const differentOutcome = 1
        const tokenCount = 1e15
        const outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i !== outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)
        const fee = await lmsrMarketMaker.calcMarketFee.call(outcomeTokenCost)
        const cost = outcomeTokenCost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.valueOf())
        await etherToken.approve(lmsrMarketMaker.address, cost, { from: accounts[buyer] })

        assert.equal(
            getParamFromTxEvent(
                await lmsrMarketMaker.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }),
                'outcomeTokenNetCost'
            ).valueOf(), outcomeTokenCost.valueOf())
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)
        const outcomeToken = OutcomeToken.at(await eventManager.outcomeTokens.call(outcomeTokenSetId, differentOutcome))
                'cost', null, 'OutcomeTokenShortSale'
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
    })

    it('trading stress testing', async () => {
        const MAX_VALUE = Decimal(2).pow(256).sub(1)

        const trader = 9
        const feeFactor = 0

        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(eventManager.address, outcomeTokenSetId, feeFactor, { from: accounts[trader] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Get ready for trading
        await etherToken.deposit({ value: 2e19, from: accounts[trader] })
        await etherToken.approve(eventManager.address, 1e19, { from: accounts[trader] })
        await eventManager.mintOutcomeTokenSet(outcomeTokenSetId, 1e19, { from: accounts[trader] })

        // Allow all trading
        const outcomeTokens = (await Promise.all(
            _.range(numOutcomes).map(i => eventManager.outcomeTokens.call(outcomeTokenSetId, i))
        )).map(OutcomeToken.at)

        await etherToken.approve(lmsrMarketMaker.address, MAX_VALUE.valueOf(), { from: accounts[trader] })
        await Promise.all(outcomeTokens.map(outcomeToken =>
            outcomeToken.approve(lmsrMarketMaker.address, MAX_VALUE.valueOf(), { from: accounts[trader] })))

        // Fund lmsrMarketMaker
        const funding = 1e16
        await lmsrMarketMaker.fund(funding, { from: accounts[trader] })

        for(let i = 0; i < 10; i++) {
            const outcomeTokenAmounts = randnums(-1e16, 1e16, numOutcomes).map(n => n.valueOf())
            const netCost = await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)

            const lmsrMarketMakerOutcomeTokenCounts = await Promise.all(outcomeTokens.map(outcomeToken =>
                outcomeToken.balanceOf.call(lmsrMarketMaker.address)))

            const lmsrMarketMakerCollateralTokenCount = await etherToken.balanceOf.call(lmsrMarketMaker.address)

            let txResult;
            try {
                txResult = await lmsrMarketMaker.trade(outcomeTokenAmounts, netCost, { from: accounts[trader] })
            } catch(e) {
                throw new Error(`trade ${ i } with input ${
                    outcomeTokenAmounts
                } and limit ${
                    netCost
                } failed while lmsrMarketMaker has:\n\n${
                    lmsrMarketMakerOutcomeTokenCounts.map(c => c.valueOf()).join('\n')
                }\n\nand ${
                    lmsrMarketMakerCollateralTokenCount.valueOf()
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
