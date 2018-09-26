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

    it('should redeem payouts in more complex scenarios', async () => {
        const { toHex, padLeft, keccak256 } = NewWeb3.utils;
        // Setup a more complex scenario
        const _oracle = accounts[1];
        const _questionId = '0x1234567812345678123456781234567812345678123456781234567812345678'; 
        const _numOutcomes = 4;
        await eventManager.prepareEvent(_oracle, _questionId, _numOutcomes);
        const _outcomeTokenSetId = keccak256(_oracle + [_questionId, _numOutcomes].map(v => padLeft(toHex(v), 64).slice(2)).join(''));
        assert.equal(await eventManager.getOutcomeTokenSetLength(_outcomeTokenSetId), 4);

        // create some buyers and purchase collateralTokens and then some outcomeTokens
        const buyers = [3, 4, 5, 6];
        const collateralTokenCounts = [1e19, 1e9, 1e18, 1000];
        for (var i=0; i<buyers.length; i++) {
            await etherToken.deposit({ value: collateralTokenCounts[i], from: accounts[buyers[i]]});
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);        
            // before we Mint, we have to approve() the collateralTokens
            await etherToken.approve(eventManager.address, collateralTokenCounts[i], { from: accounts[buyers[i]]});
            await eventManager.mintOutcomeTokenSet(_outcomeTokenSetId, collateralTokenCounts[i], { from: accounts[buyers[i]]} );
        }

        // resolve the event
        const resultsTransaction = await eventManager.receiveResult(_questionId, 
            '0x' + [
                padLeft('14D', 64), // 333
                padLeft('29A', 64), // 666 
                padLeft('1', 64), // 1
                padLeft('0', 64)                     
            ].join(''),
            { from: _oracle }
        );
        assert.equal(await eventManager.payoutDenominator.call(_outcomeTokenSetId).then(res => res.toString()), 1000);

        // assert correct payouts for outcome tokens 
        const payoutsForOutcomeTokens = [333, 666, 1, 0];
        for (var i=0; i<buyers.length; i++) {
            let individualOutcomeToken = OutcomeToken.at(await eventManager.outcomeTokens(_outcomeTokenSetId, i));
            assert.equal(await individualOutcomeToken.balanceOf(accounts[buyers[i]]).valueOf(), collateralTokenCounts[i]);
            assert(await eventManager.payoutForOutcomeToken(individualOutcomeToken.address), payoutsForOutcomeTokens[i]);
        }

        // assert payout redemption
        for (var i=0; i<buyers.length; i++) {
            var denominator = await eventManager.payoutDenominator(_outcomeTokenSetId);
            for (var j=0; j<_numOutcomes; j++) {
                let individualOutcomeToken = OutcomeToken.at(await eventManager.outcomeTokens(_outcomeTokenSetId, j)); 
                await individualOutcomeToken.approve(eventManager.address, await individualOutcomeToken.balanceOf(accounts[buyers[i]]), { from: accounts[buyers[i]] });
            }
            await eventManager.redeemPayout(_outcomeTokenSetId, { from: accounts[buyers[i]] });
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);
        }
    });

    it('should not be able to burn a partial outcome set', async () => {
        // waiting for MarketMaker integration.
    });
})
