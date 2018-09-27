const testGas = require('@gnosis.pm/truffle-nice-tools').testGas

const utils = require('./utils')
const NewWeb3 = require('web3')
const ConditionalPaymentProcessor = artifacts.require('ConditionalPaymentProcessor')
const ConditionalPaymentProcessorFactory = artifacts.require('ConditionalPaymentProcessorFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')
const contracts = [ConditionalPaymentProcessor, ConditionalPaymentProcessorFactory, OutcomeToken]

contract('ConditionalPaymentProcessor', function (accounts) {
    let conditionalPaymentProcessorFactory
    let etherToken
    let oracle, questionId, outcomeTokenCount, conditionalPaymentProcessor
    let conditionId

    before(testGas.createGasStatCollectorBeforeHook(contracts))
    after(testGas.createGasStatCollectorAfterHook(contracts))

    before(async () => {
        const { toHex, padLeft, keccak256 } = NewWeb3.utils;
        conditionalPaymentProcessorFactory = await ConditionalPaymentProcessorFactory.deployed()
        etherToken = await WETH9.deployed()

        conditionalPaymentProcessor = utils.getParamFromTxEvent(
            await conditionalPaymentProcessorFactory.createConditionalPaymentProcessor(etherToken.address),
            'conditionalPaymentProcessor', ConditionalPaymentProcessor
        )

        // prepare condition
        oracle = accounts[1]
        questionId = '0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe'
        outcomeTokenCount = 2
        await conditionalPaymentProcessor.prepareCondition(oracle, questionId, outcomeTokenCount)

        conditionId = keccak256(oracle + [questionId, outcomeTokenCount].map(v => padLeft(toHex(v), 64).slice(2)).join(''))
    })

    it('should target the right conditional payment processor');
    it('should be creatable when nonexistent');

    it('should have obtainable conditionIds if in possession of oracle, questionId, and outcomeTokenCount', async () => {
        assert.equal((await conditionalPaymentProcessor.getOutcomeTokenCount(conditionId)).valueOf(), outcomeTokenCount)
    });

    it('should mint and burn outcome tokens', async () => {
        // Mint all outcomes
        const buyer = 0
        const collateralTokenCount = 1e19
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        for(let i = 0; i < 10; i++)
            await conditionalPaymentProcessor.mintOutcomeTokenSet(0, conditionId, collateralTokenCount / 10, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(conditionalPaymentProcessor.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await conditionalPaymentProcessor.getOutcomeToken.call(0, conditionId, 0))
        const outcomeToken2 = OutcomeToken.at(await conditionalPaymentProcessor.getOutcomeToken.call(0, conditionId, 1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Validate getters
        assert.equal(await conditionalPaymentProcessor.getOutcomeTokenCount.call(conditionId), 2)

        // Burn all outcomes
        await outcomeToken1.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        await outcomeToken2.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        await conditionalPaymentProcessor.burnOutcomeTokenSet(0, conditionId, collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(conditionalPaymentProcessor.address), 0)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
    })

    it('should mint and set outcome tokens and redeem payouts for conditions', async () => {
        // Mint outcome tokens
        const buyer = 2
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        await conditionalPaymentProcessor.mintOutcomeTokenSet(0, conditionId, collateralTokenCount, { from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf.call(conditionalPaymentProcessor.address)).valueOf(), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = OutcomeToken.at(await conditionalPaymentProcessor.getOutcomeToken.call(0, conditionId, 0))
        const outcomeToken2 = OutcomeToken.at(await conditionalPaymentProcessor.getOutcomeToken.call(0, conditionId, 1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        // Set outcome in condition
        await conditionalPaymentProcessor.receiveResult(questionId,
            '0x' + [
                NewWeb3.utils.padLeft('3', 64),
                NewWeb3.utils.padLeft('7', 64),
            ].join(''),
            { from: oracle })
        assert.equal(await conditionalPaymentProcessor.payoutDenominator.call(conditionId), 10)
        assert.equal(await conditionalPaymentProcessor.payoutNumerators.call(conditionId, 0), 3)
        assert.equal(await conditionalPaymentProcessor.payoutNumerators.call(conditionId, 1), 7)

        // Redeem payout for buyer account
        await outcomeToken2.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        const buyerPayout = utils.getParamFromTxEvent(
            await conditionalPaymentProcessor.redeemPayout(0, conditionId, { from: accounts[buyer] }),
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
        const _outcomeTokenCount = 4;
        await conditionalPaymentProcessor.prepareCondition(_oracle, _questionId, _outcomeTokenCount);
        const _conditionId = keccak256(_oracle + [_questionId, _outcomeTokenCount].map(v => padLeft(toHex(v), 64).slice(2)).join(''));
        assert.equal(await conditionalPaymentProcessor.getOutcomeTokenCount(_conditionId), 4);

        // create some buyers and purchase collateralTokens and then some outcomeTokens
        const buyers = [3, 4, 5, 6];
        const collateralTokenCounts = [1e19, 1e9, 1e18, 1000];
        for (var i=0; i<buyers.length; i++) {
            await etherToken.deposit({ value: collateralTokenCounts[i], from: accounts[buyers[i]]});
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);        
            // before we Mint, we have to approve() the collateralTokens
            await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCounts[i], { from: accounts[buyers[i]]});
            await conditionalPaymentProcessor.mintOutcomeTokenSet(0, _conditionId, collateralTokenCounts[i], { from: accounts[buyers[i]]} );
        }

        // resolve the condition
        const resultsTransaction = await conditionalPaymentProcessor.receiveResult(_questionId, 
            '0x' + [
                padLeft('14D', 64), // 333
                padLeft('29A', 64), // 666 
                padLeft('1', 64), // 1
                padLeft('0', 64),
            ].join(''),
            { from: _oracle }
        );
        assert.equal(await conditionalPaymentProcessor.payoutDenominator.call(_conditionId).then(res => res.toString()), 1000);

        // assert correct payouts for outcome tokens 
        const payoutsForOutcomeTokens = [333, 666, 1, 0];
        for (var i=0; i<buyers.length; i++) {
            let individualOutcomeToken = OutcomeToken.at(await conditionalPaymentProcessor.getOutcomeToken(0, _conditionId, i));
            assert.equal(await individualOutcomeToken.balanceOf(accounts[buyers[i]]).valueOf(), collateralTokenCounts[i]);
            assert(await conditionalPaymentProcessor.payoutNumerators(_conditionId, i), payoutsForOutcomeTokens[i]);
        }

        // assert payout redemption
        for (var i=0; i<buyers.length; i++) {
            var denominator = await conditionalPaymentProcessor.payoutDenominator(_conditionId);
            for (var j=0; j<_outcomeTokenCount; j++) {
                let individualOutcomeToken = OutcomeToken.at(await conditionalPaymentProcessor.getOutcomeToken(0, _conditionId, j));
                await individualOutcomeToken.approve(conditionalPaymentProcessor.address, await individualOutcomeToken.balanceOf(accounts[buyers[i]]), { from: accounts[buyers[i]] });
            }
            await conditionalPaymentProcessor.redeemPayout(0, _conditionId, { from: accounts[buyers[i]] });
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);
        }
    });

    it('should not be able to burn a partial outcome set');
})
