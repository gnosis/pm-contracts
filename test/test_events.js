const testGas = require('@gnosis.pm/truffle-nice-tools').testGas

const utils = require('./utils')
const NewWeb3 = require('web3')
const EventManager = artifacts.require('EventManager')
const EventManagerFactory = artifacts.require('EventManagerFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')

const contracts = [EventManager, EventManagerFactory, OutcomeToken, WETH9]

contract('EventManager', function (accounts) {
    let eventManagerFactory
    let etherToken
    let oracle, questionId, numOutcomes, eventManager
    let outcomeTokenSetId

    before(testGas.createGasStatCollectorBeforeHook(contracts))
    after(testGas.createGasStatCollectorAfterHook(contracts))

    before(async () => {
        eventManagerFactory = await EventManagerFactory.deployed()
        etherToken = await WETH9.deployed()

        eventManager = utils.getParamFromTxEvent(
            await eventManagerFactory.createEventManager(etherToken.address),
            'eventManager', EventManager
        )

        // prepare event
        oracle = accounts[1]
        questionId = '0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe'
        numOutcomes = 2
        await eventManager.prepareEvent(oracle, questionId, numOutcomes)

        const { toHex, padLeft, keccak256 } = NewWeb3.utils;
        outcomeTokenSetId = keccak256(oracle + [questionId, numOutcomes].map(v => padLeft(toHex(v), 64).slice(2)).join(''))
    })

    it('should target the right event manager');
    it('should be creatable when nonexistent');

    it('should have obtainable outcomeTokenSetIds if in possession of oracle, questionId, and numOutcomes', async () => {
        assert.equal((await eventManager.getOutcomeTokenSetLength(outcomeTokenSetId)).valueOf(), numOutcomes)
    });

    it('should buy and sell all outcomes', async () => {
        // Buy all outcomes
        const buyer = 0
        const collateralTokenCount = 1e19
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        for(let i = 0; i < 10; i++)
            await eventManager.mintOutcomeTokenSet(outcomeTokenSetId, collateralTokenCount / 10, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(eventManager.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await eventManager.outcomeTokens.call(outcomeTokenSetId, 0))
        const outcomeToken2 = OutcomeToken.at(await eventManager.outcomeTokens.call(outcomeTokenSetId, 1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Sell all outcomes
        await outcomeToken1.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        await outcomeToken2.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        await eventManager.burnOutcomeTokenSet(outcomeTokenSetId, collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(eventManager.address), 0)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
    })

    it('should buy and verify outcomes', async () => {
        // Buy all outcomes
        const buyer = 1
        const collateralTokenCount = 1e18
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        for(let i = 0; i < 10; i++)
            await eventManager.buyAllOutcomes(collateralTokenCount / 10, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(eventManager.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await eventManager.outcomeTokens.call(0))
        const outcomeToken2 = OutcomeToken.at(await eventManager.outcomeTokens.call(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Validate getters
        assert.equal(await eventManager.getOutcomeCount.call(), 2)
        assert.deepEqual(await eventManager.getOutcomeTokens.call(), [await eventManager.outcomeTokens.call(0), await eventManager.outcomeTokens.call(1)])
        //using parseInt and .valueOf because of strictEqual comparison in arrays.deepEqual()
        const outcomeTokenDistribution = await eventManager.getOutcomeTokenDistribution.call(accounts[buyer])
        assert.deepEqual(
            [parseInt(outcomeTokenDistribution[0].valueOf(), 10), parseInt(outcomeTokenDistribution[1].valueOf(), 10)],
            [collateralTokenCount, collateralTokenCount])
    })

    it('should buy, set and redeem outcomes for categorical event', async () => {
        // Buy all outcomes
        const buyer = 2
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        await eventManager.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(eventManager.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await eventManager.outcomeTokens.call(0))
        const outcomeToken2 = OutcomeToken.at(await eventManager.outcomeTokens.call(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Set outcome in event
        await eventManager.receiveResult('0x0', NewWeb3.utils.padLeft('0x1', 64), { from: oracle })
        assert.equal(await eventManager.outcome.call(), 1)
        assert.equal(await eventManager.isOutcomeSet.call(),true)

        //Redeem winnings for buyer account
        const buyerWinnings = utils.getParamFromTxEvent(
            await eventManager.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })

    it('should buy, set, and redeem outcomes for scalar event', async () => {
        const scalarEvent = utils.getParamFromTxEvent(
            await eventManagerFactory.createScalarEvent(etherToken.address, oracle, -100, 100),
            'scalarEvent', ScalarEvent
        )
        // Buy all outcomes
        const buyer = 3
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(scalarEventManager.address, collateralTokenCount, { from: accounts[buyer] })
        await scalarEventManager.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEventManager.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await scalarEventManager.outcomeTokens(0))
        const outcomeToken2 = OutcomeToken.at(await scalarEventManager.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Set outcome in scalarEvent
        await scalarEventManager.receiveResult('0x0', '0x0', { from: oracle })
        assert.equal(await scalarEventManager.outcome.call(), 0)
        assert.equal(await scalarEventManager.isOutcomeSet.call(),true)

        //Redeem winnings for buyer account
        const buyerWinnings = utils.getParamFromTxEvent(
            await scalarEventManager.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })
})
