const testGas = require('@gnosis.pm/truffle-nice-tools').testGas

const utils = require('./utils')
const NewWeb3 = require('web3')
const EventManager = artifacts.require('EventManager')
const EventManagerFactory = artifacts.require('EventManagerFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')
const contracts = [EventManager, EventManagerFactory, OutcomeToken]

contract('EventManager', function (accounts) {
    let eventManagerFactory
    let etherToken
    let oracle, questionId, numOutcomes, eventManager
    let outcomeTokenSetId

    before(testGas.createGasStatCollectorBeforeHook(contracts))
    after(testGas.createGasStatCollectorAfterHook(contracts))

    before(async () => {
        const { toHex, padLeft, keccak256 } = NewWeb3.utils;
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

        outcomeTokenSetId = keccak256(oracle + [questionId, numOutcomes].map(v => padLeft(toHex(v), 64).slice(2)).join(''))
    })

    it('should target the right event manager');
    it('should be creatable when nonexistent');

    it('should have obtainable outcomeTokenSetIds if in possession of oracle, questionId, and numOutcomes', async () => {
        assert.equal((await eventManager.getOutcomeTokenSetLength(outcomeTokenSetId)).valueOf(), numOutcomes)
    });

    it('should mint and burn outcome tokens', async () => {
        // Mint all outcomes
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

        // Validate getters
        assert.equal(await eventManager.getOutcomeTokenSetLength.call(outcomeTokenSetId), 2)

        // Burn all outcomes
        await outcomeToken1.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        await outcomeToken2.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        await eventManager.burnOutcomeTokenSet(outcomeTokenSetId, collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(eventManager.address), 0)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
    })

    it('should mint and set outcome tokens and redeem payouts for events', async () => {
        // Mint outcome tokens
        const buyer = 2
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        await eventManager.mintOutcomeTokenSet(outcomeTokenSetId, collateralTokenCount, { from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf.call(eventManager.address)).valueOf(), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await eventManager.outcomeTokens.call(outcomeTokenSetId, 0))
        const outcomeToken2 = OutcomeToken.at(await eventManager.outcomeTokens.call(outcomeTokenSetId, 1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Set outcome in event
        await eventManager.receiveResult(questionId,
            '0x' + [
                NewWeb3.utils.padLeft('3', 64),
                NewWeb3.utils.padLeft('7', 64),
            ].join(''),
            { from: oracle })
        assert.equal(await eventManager.payoutDenominator.call(outcomeTokenSetId), 10)
        assert.equal(await eventManager.payoutForOutcomeToken.call(outcomeToken1.address), 3)
        assert.equal(await eventManager.payoutForOutcomeToken.call(outcomeToken2.address), 7)

        // Redeem payout for buyer account
        await outcomeToken2.approve(eventManager.address, collateralTokenCount, { from: accounts[buyer] })
        const buyerPayout = utils.getParamFromTxEvent(
            await eventManager.redeemPayout(outcomeTokenSetId, { from: accounts[buyer] }),
            'payout')
        assert.equal(buyerPayout.valueOf(), collateralTokenCount * 7 / 10)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), buyerPayout.valueOf())
    })

    it('should redeem payouts in more complex scenarios')
})
