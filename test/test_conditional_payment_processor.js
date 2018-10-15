const testGas = require('@gnosis.pm/truffle-nice-tools').testGas

const utils = require('./utils')
const NewWeb3 = require('web3')
const { toHex, padLeft, keccak256 } = NewWeb3.utils;
const ConditionalPaymentProcessor = artifacts.require('ConditionalPaymentProcessor')
const WETH9 = artifacts.require('WETH9')
const contracts = [ConditionalPaymentProcessor]

contract('ConditionalPaymentProcessor', function (accounts) {
    let conditionalPaymentProcessorFactory
    let etherToken
    let oracle, questionId, payoutSlotCount, conditionalPaymentProcessor
    let conditionId

    before(testGas.createGasStatCollectorBeforeHook(contracts))
    after(testGas.createGasStatCollectorAfterHook(contracts))

    before(async () => {
        conditionalPaymentProcessor = await ConditionalPaymentProcessor.deployed()
        etherToken = await WETH9.deployed()

        // prepare condition
        oracle = accounts[1]
        questionId = '0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe'
        payoutSlotCount = 2
        await conditionalPaymentProcessor.prepareCondition(oracle, questionId, payoutSlotCount)

        conditionId = keccak256(oracle + [questionId, payoutSlotCount].map(v => padLeft(toHex(v), 64).slice(2)).join(''))
    })

    it('should target the right conditional payment processor');
    it('should be creatable when nonexistent');

    it('should have obtainable conditionIds if in possession of oracle, questionId, and payoutSlotCount', async () => {
        assert.equal((await conditionalPaymentProcessor.getPayoutSlotCount(conditionId)).valueOf(), payoutSlotCount)
    });

    it('should split and merge positions on payout slots', async () => {
        // Mint all outcomes
        const buyer = 0
        const collateralTokenCount = 1e19
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        for(let i = 0; i < 10; i++)
            await conditionalPaymentProcessor.splitPosition(etherToken.address, 0, conditionId, [0b01, 0b10], collateralTokenCount / 10, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(conditionalPaymentProcessor.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)),
                accounts[buyer]),
            collateralTokenCount)
        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)),
                accounts[buyer]),
            collateralTokenCount)

        // Validate getters
        assert.equal(await conditionalPaymentProcessor.getPayoutSlotCount.call(conditionId), 2)

        // Burn all outcomes
        await conditionalPaymentProcessor.mergePosition(etherToken.address, 0, conditionId, [0b01, 0b10], collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(conditionalPaymentProcessor.address), 0)

        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)),
                accounts[buyer]),
            0)
        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)),
                accounts[buyer]),
            0)
    })

    it('should split positions, set payout values, and redeem payouts for conditions', async () => {
        // Mint payout slots
        const buyer = 2
        const recipient = 7
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        await conditionalPaymentProcessor.splitPosition(etherToken.address, 0, conditionId, [0b01, 0b10], collateralTokenCount, { from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf.call(conditionalPaymentProcessor.address)).valueOf(), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)),
                accounts[buyer]),
            collateralTokenCount)
        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)),
                accounts[buyer]),
            collateralTokenCount)

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
        await conditionalPaymentProcessor.transferFrom(accounts[buyer], accounts[recipient],
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)),
            collateralTokenCount, { from: accounts[buyer] })
        const buyerPayout = utils.getParamFromTxEvent(
            await conditionalPaymentProcessor.redeemPayout(etherToken.address, 0, conditionId, [0b10], { from: accounts[buyer] }),
            'payout')
        assert.equal(buyerPayout.valueOf(), collateralTokenCount * 7 / 10)
        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)),
                accounts[recipient]),
            collateralTokenCount)
        assert.equal(await conditionalPaymentProcessor.balanceOf.call(
            keccak256(
                etherToken.address + keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)),
                accounts[buyer]),
            0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), buyerPayout.valueOf())
    })

    it('should redeem payouts in more complex scenarios', async () => {
        // Setup a more complex scenario
        const _oracle = accounts[1];
        const _questionId = '0x1234567812345678123456781234567812345678123456781234567812345678'; 
        const _payoutSlotCount = 4;
        await conditionalPaymentProcessor.prepareCondition(_oracle, _questionId, _payoutSlotCount);
        const _conditionId = keccak256(_oracle + [_questionId, _payoutSlotCount].map(v => padLeft(toHex(v), 64).slice(2)).join(''));
        assert.equal(await conditionalPaymentProcessor.getPayoutSlotCount(_conditionId), 4);

        // create some buyers and purchase collateralTokens and then some payoutSlots
        const buyers = [3, 4, 5, 6];
        const collateralTokenCounts = [1e19, 1e9, 1e18, 1000];
        for (var i=0; i<buyers.length; i++) {
            await etherToken.deposit({ value: collateralTokenCounts[i], from: accounts[buyers[i]]});
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);        
            // before we Mint, we have to approve() the collateralTokens
            await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCounts[i], { from: accounts[buyers[i]]});
            await conditionalPaymentProcessor.splitPosition(etherToken.address, 0, _conditionId, [0b0001, 0b0010, 0b0100, 0b1000], collateralTokenCounts[i], { from: accounts[buyers[i]]} );
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

        // assert correct payouts for payout slots
        const payoutsForPayoutSlots = [333, 666, 1, 0];
        for (var i=0; i<buyers.length; i++) {
            assert.equal(await conditionalPaymentProcessor.balanceOf.call(
                keccak256(
                    etherToken.address + keccak256(_conditionId + padLeft(toHex(1 << i), 64).slice(2)).slice(2)),
                    accounts[buyers[i]]),
                collateralTokenCounts[i])
            assert(await conditionalPaymentProcessor.payoutNumerators(_conditionId, i), payoutsForPayoutSlots[i]);
        }

        // assert payout redemption
        for (var i=0; i<buyers.length; i++) {
            await conditionalPaymentProcessor.redeemPayout(etherToken.address, 0, _conditionId, [0b0001, 0b0010, 0b0100, 0b1000], { from: accounts[buyers[i]] });
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);
        }
    });

    it('should be able to merge a partial payout set');
})
