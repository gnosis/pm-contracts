const utils = require('./utils')
const NewWeb3 = require('web3')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const EventFactory = artifacts.require('EventFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')

const contracts = [CategoricalEvent, ScalarEvent, EventFactory, OutcomeToken, WETH9]

contract('Event', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let ipfsHash, oracle, event

    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        eventFactory = await EventFactory.deployed()
        etherToken = await WETH9.deployed()

        // create event
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = accounts[1]
        event = utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracle, 2),
            'categoricalEvent', CategoricalEvent
        )
    })

    it('should buy and sell all outcomes', async () => {
        // Buy all outcomes
        const buyer = 0
        const collateralTokenCount = 1e19
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        for(let i = 0; i < 10; i++)
            await event.buyAllOutcomes(collateralTokenCount / 10, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await event.outcomeTokens.call(0))
        const outcomeToken2 = OutcomeToken.at(await event.outcomeTokens.call(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Sell all outcomes
        await event.sellAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(event.address), 0)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
    })

    it('should buy and verify outcomes', async () => {
        // Buy all outcomes
        const buyer = 1
        const collateralTokenCount = 1e18
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        for(let i = 0; i < 10; i++)
            await event.buyAllOutcomes(collateralTokenCount / 10, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await event.outcomeTokens.call(0))
        const outcomeToken2 = OutcomeToken.at(await event.outcomeTokens.call(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Validate getters
        assert.equal(await event.getOutcomeCount.call(), 2)
        assert.deepEqual(await event.getOutcomeTokens.call(), [await event.outcomeTokens.call(0), await event.outcomeTokens.call(1)])
        //using parseInt and .valueOf because of strictEqual comparison in arrays.deepEqual()
        const outcomeTokenDistribution = await event.getOutcomeTokenDistribution.call(accounts[buyer])
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

        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await event.outcomeTokens.call(0))
        const outcomeToken2 = OutcomeToken.at(await event.outcomeTokens.call(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Set outcome in event
        await event.receiveResult('0x0', NewWeb3.utils.padLeft('0x1', 64), { from: oracle })
        assert.equal(await event.outcome.call(), 1)
        assert.equal(await event.isOutcomeSet.call(),true)

        //Redeem winnings for buyer account
        const buyerWinnings = utils.getParamFromTxEvent(
            await event.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })

    it('should buy, set, and redeem outcomes for scalar event', async () => {
        const scalarEvent = utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle, -100, 100),
            'scalarEvent', ScalarEvent
        )
        // Buy all outcomes
        const buyer = 3
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Set outcome in scalarEvent
        await scalarEvent.receiveResult('0x0', '0x0', { from: oracle })
        assert.equal(await scalarEvent.outcome.call(), 0)
        assert.equal(await scalarEvent.isOutcomeSet.call(),true)

        //Redeem winnings for buyer account
        const buyerWinnings = utils.getParamFromTxEvent(
            await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })
})
