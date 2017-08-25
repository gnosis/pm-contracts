const utils = require('./utils')

const Event = artifacts.require('Event')
const EventFactory = artifacts.require('EventFactory')
const Token = artifacts.require('Token')
const EtherToken = artifacts.require('EtherToken')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')

const contracts = [Event, EventFactory, Token, EtherToken, CentralizedOracle, CentralizedOracleFactory]

contract('Event', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let ipfsHash, oracle, event

    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await EtherToken.deployed()

        // create event
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )
        event = utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
            'categoricalEvent', Event
        )
    })

    it('should buy and sell all outcomes', async () => {
        // Buy all outcomes
        const buyer = 0
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), 0)

        const outcomeToken1 = Token.at(await event.outcomeTokens(0))
        const outcomeToken2 = Token.at(await event.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), collateralTokenCount)

        // Sell all outcomes
        await event.sellAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await etherToken.balanceOf(event.address), 0)
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), 0)
    })

    it('should buy and verify outcomes', async () => {
        // Buy all outcomes
        const buyer = 1
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), 0)

        const outcomeToken1 = Token.at(await event.outcomeTokens(0))
        const outcomeToken2 = Token.at(await event.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), collateralTokenCount)

        // Validate getters
        assert.equal(await event.getOutcomeCount(), 2)
        assert.deepEqual(await event.getOutcomeTokens(), [await event.outcomeTokens(0), await event.outcomeTokens(1)])
        //using parseInt and .valueOf because of strictEqual comparison in arrays.deepEqual()
        const outcomeTokenDistribution = await event.getOutcomeTokenDistribution(accounts[buyer])
        assert.deepEqual(
            [parseInt(outcomeTokenDistribution[0].valueOf(), 10), parseInt(outcomeTokenDistribution[1].valueOf(),10)],
            [collateralTokenCount, collateralTokenCount])
    })

    it('should buy, set and redeem outcomes for categorical event', async () => {
        // Buy all outcomes
        const buyer = 2
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), 0)

        const outcomeToken1 = Token.at(await event.outcomeTokens(0))
        const outcomeToken2 = Token.at(await event.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), collateralTokenCount)

        //Set outcome in oracle contract
        await oracle.setOutcome(1)
        assert.equal(await oracle.getOutcome(), 1)
        assert.equal(await oracle.isOutcomeSet(), true)

        //Set outcome in event
        await event.setOutcome()
        assert.equal(await event.outcome(), 1)
        assert.equal(await event.isOutcomeSet(),true)

        //Redeem winnings for buyer account
        const buyerWinnings = utils.getParamFromTxEvent(
            await event.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)
    })

    it('should buy, set, and redeem outcomes for scalar event', async () => {
        const scalarEvent = utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', Event
        )
        // Buy all outcomes
        const buyer = 3
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), 0)

        const outcomeToken1 = Token.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = Token.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), collateralTokenCount)

        //Set outcome in oracle contract
        await oracle.setOutcome(0)
        assert.equal(await oracle.getOutcome(), 0)
        assert.equal(await oracle.isOutcomeSet(), true)

        //Set outcome in event
        await scalarEvent.setOutcome()
        assert.equal(await scalarEvent.outcome(), 0)
        assert.equal(await scalarEvent.isOutcomeSet(), true)

        //Redeem winnings for buyer account
        const buyerWinnings = utils.getParamFromTxEvent(
            await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)
    })
})
