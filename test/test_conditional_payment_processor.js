const utils = require('./utils')
const NewWeb3 = require('web3')
const { toHex, padLeft, keccak256, asciiToHex, hexToAscii, hexToNumber, toBN } = NewWeb3.utils;
const ConditionalPaymentProcessor = artifacts.require('ConditionalPaymentProcessor')
const WETH9 = artifacts.require('WETH9')

contract('ConditionalPaymentProcessor', function (accounts) {
    let conditionalPaymentProcessorFactory
    let etherToken
    let oracle, questionId, payoutSlotCount, conditionalPaymentProcessor
    let conditionId

    before(async () => {
        conditionalPaymentProcessor = await ConditionalPaymentProcessor.deployed()
        etherToken = await WETH9.deployed()

        // prepare condition
        oracle = accounts[1]

        questionId = '0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe'
        payoutSlotCount = 2
        await conditionalPaymentProcessor.prepareCondition(oracle, questionId, payoutSlotCount)

        conditionId = keccak256(oracle + [questionId, payoutSlotCount].map(v => padLeft(toHex(v), 64).slice(2)).join(''))
    });

    it('should have obtainable conditionIds if in possession of oracle, questionId, and payoutSlotCount', async () => {
        assert.equal((await conditionalPaymentProcessor.getPayoutSlotCount(conditionId)).valueOf(), payoutSlotCount);
        assert.equal((await conditionalPaymentProcessor.payoutDenominator(conditionId)).valueOf(), 0);
    });

    it('should not be able to prepare the same condition more than once', async () => {
        try {
            await conditionalPaymentProcessor.prepareCondition(oracle, questionId, payoutSlotCount)
            assert.fail('Transaction should have reverted');
        } catch (e) {
          assert(e);  
        }  
    })

    it('should split and merge positions on payout slots', async () => {
        const buyer = 0
        const collateralTokenCount = 1e19
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCount, { from: accounts[buyer] })
        
        for(let i = 0; i < 10; i++) {
            await conditionalPaymentProcessor.splitPosition(etherToken.address, asciiToHex(0), conditionId, [0b01, 0b10], collateralTokenCount / 10, { from: accounts[buyer] })
        }

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

        await conditionalPaymentProcessor.mergePositions(etherToken.address, asciiToHex(0), conditionId, [0b01, 0b10], collateralTokenCount, { from: accounts[buyer] })
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
        
        await conditionalPaymentProcessor.splitPosition(etherToken.address, asciiToHex(0), conditionId, [0b01, 0b10], collateralTokenCount, { from: accounts[buyer] })
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
            await conditionalPaymentProcessor.redeemPositions(etherToken.address, asciiToHex(0), conditionId, [0b10], { from: accounts[buyer] }),
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

        const recipientPayout = utils.getParamFromTxEvent(
            await conditionalPaymentProcessor.redeemPositions(etherToken.address, asciiToHex(0), conditionId, [0b01], { from: accounts[recipient] }), 'payout')
        
        assert.equal((await etherToken.balanceOf.call(accounts[recipient])).toNumber(), recipientPayout.valueOf());            
        assert.equal((await etherToken.balanceOf.call(accounts[buyer])).toNumber(), buyerPayout.valueOf())
    })

    it('should redeem payouts in more complex scenarios', async () => {
        // Setup a more complex scenario
        const _oracle = accounts[1];
        const _questionId = '0x1234567812345678123456781234567812345678123456781234567812345678'; 
        const _payoutSlotCount = 4;
        await conditionalPaymentProcessor.prepareCondition(_oracle, _questionId, _payoutSlotCount);
        const _conditionId = keccak256(_oracle + [_questionId, _payoutSlotCount].map(v => padLeft(toHex(v), 64).slice(2)).join(''));

        assert.equal(await conditionalPaymentProcessor.getPayoutSlotCount(_conditionId), 4);
        for (var i=0; i<4; i++) {
            assert.equal((await conditionalPaymentProcessor.payoutNumerators(_conditionId, i)).valueOf(), 0);
        }
        assert.equal((await conditionalPaymentProcessor.payoutDenominator(_conditionId)).valueOf(), 0);
        assert.notEqual(conditionId, _conditionId);

        // create some buyers and purchase collateralTokens and then some payoutSlots
        const buyers = [3, 4, 5, 6];
        const collateralTokenCounts = [1e19, 1e9, 1e18, 1000];
        for (var i=0; i<buyers.length; i++) {
            await etherToken.deposit({ value: collateralTokenCounts[i], from: accounts[buyers[i]]});
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);        
            // before we Mint, we have to approve() the collateralTokens
            await etherToken.approve(conditionalPaymentProcessor.address, collateralTokenCounts[i], { from: accounts[buyers[i]]});
            await conditionalPaymentProcessor.splitPosition(etherToken.address, asciiToHex(0), _conditionId, [0b0001, 0b0010, 0b0100, 0b1000], collateralTokenCounts[i], { from: accounts[buyers[i]]} );
        }

        try {
            await conditionalPaymentProcessor.receiveResult(_questionId, 
                '0x' + [
                    padLeft('14D', 64), // 333
                    padLeft('29A', 64), // 666 
                    padLeft('1', 64), // 1
                    padLeft('0', 64),
                ].join(''),
                { from: accounts[9] }
            );
            assert.fail('Transaction should have reverted');
        } catch (e) {
          assert(e);  
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
            assert.equal(await conditionalPaymentProcessor.payoutNumerators(_conditionId, i), payoutsForPayoutSlots[i]);
            assert.equal(await conditionalPaymentProcessor.payoutDenominator(_conditionId), 1000);
        }

        // assert payout redemption
        for (var i=0; i<buyers.length; i++) {
            await conditionalPaymentProcessor.redeemPositions(etherToken.address, asciiToHex(0), _conditionId, [0b0001, 0b0010, 0b0100, 0b1000], { from: accounts[buyers[i]] });
            assert.equal(await etherToken.balanceOf(accounts[buyers[i]]).then(res => res.toString()), collateralTokenCounts[i]);
        }
    });
})

contract('ConditionalPaymentProcessor', function (accounts) {
    let conditionalPaymentProcessor, etherToken, 
    oracle1, oracle2, oracle3,
    questionId1, questionId2, questionId3,
    payoutSlotCount1, payoutSlotCount2, payoutSlotCount3,
    player1, player2, player3,
    conditionId1, conditionId2, conditionId3

    before(async () => {
        conditionalPaymentProcessor = await ConditionalPaymentProcessor.deployed()
        etherToken = await WETH9.deployed()

        // prepare condition
        oracle1 = accounts[1]
        oracle2 = accounts[2]
        oracle3 = accounts[3]

        questionId1 = '0x1234987612349876123498761234987612349876123498761234987612349876'
        questionId2 = '0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe'
        questionId3 = '0xab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12'
        questionId4 = '"0xab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12"'

        payoutSlotCount1 = 2 
        payoutSlotCount2 = 3 
        payoutSlotCount3 = 4 

        player1 = accounts[4]
        player2 = accounts[5]
        player3 = accounts[6]

        await conditionalPaymentProcessor.prepareCondition(oracle1, questionId1, payoutSlotCount1)
        await conditionalPaymentProcessor.prepareCondition(oracle2, questionId2, payoutSlotCount2)
        await conditionalPaymentProcessor.prepareCondition(oracle3, questionId3, payoutSlotCount3)

        conditionId1 = keccak256(oracle1 + [questionId1, payoutSlotCount1].map(v => padLeft(toHex(v), 64).slice(2)).join(''))
        conditionId2 = keccak256(oracle2 + [questionId2, payoutSlotCount2].map(v => padLeft(toHex(v), 64).slice(2)).join(''))
        conditionId3 = keccak256(oracle3 + [questionId3, payoutSlotCount3].map(v => padLeft(toHex(v), 64).slice(2)).join(''))

        await etherToken.deposit({value: 1e19, from: player1 })
        await etherToken.approve(conditionalPaymentProcessor.address, 1e19, { from: player1 })        
        await etherToken.deposit({value: 1e19, from: player2 }) 
        await etherToken.approve(conditionalPaymentProcessor.address, 1e19, { from: player2 })        
        await etherToken.deposit({value: 1e19, from: player3 })
        await etherToken.approve(conditionalPaymentProcessor.address, 1e19, { from: player3 })   
    });

    it.skip('Invalid initial positions should not give any tokens', async () => {
        await conditionalPaymentProcessor.splitPosition(etherToken.address, asciiToHex(0), conditionId1, [0b01], 1e19, { from: player1 });

        assert.equal(await conditionalPaymentProcessor.balanceOf(
            keccak256(etherToken.address, 0 + keccak256(conditionId1, padLeft(toHex(0b01), 64).slice(2)).slice(2)), player1), 0)
        assert.equal(await etherToken.balanceOf.call(player1).then(res => res.toString()), 1e19);

        try {
            await conditionalPaymentProcessor.splitPosition(etherToken.address, 0, conditionId1, [0b01, 0b111], 1e19, { from: player1 });
            assert.fail('Worked with an invalid index set.');
        } catch (e) {
            assert(e);
        }
        try {
            await conditionalPaymentProcessor.splitPosition(etherToken.address, 0, conditionId1, [0b01, 0b11], 1e19, { from: player1 });
            assert.fail('Worked with an invalid index set.');
        } catch (e) {
            assert(e);
        }
        try {
            await conditionalPaymentProcessor.splitPosition(etherToken.address, 0, conditionId1, [0b01, 0b11, 0b0], 1e19, { from: player1 });
            assert.fail('Worked with an invalid index set.');
        } catch (e) {
            assert(e);
        }
    })

    it("Should be able to split and merge in more complex scenarios", async () => {
        await conditionalPaymentProcessor.splitPosition(etherToken.address, asciiToHex(0), conditionId1, [0b01, 0b10], 1000, { from: player1 });

        const collectionId1 = keccak256(conditionId1 + padLeft(toHex(0b01), 64).slice(2))
        const collectionId2 = keccak256(conditionId1 + padLeft(toHex(0b10), 64).slice(2))
        const positionId1 = keccak256(etherToken.address + collectionId1.slice(2))
        const positionId2 = keccak256(etherToken.address + collectionId2.slice(2))

        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId1, player1).then(r => r.toNumber()), 1000)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId2, player1).then(r => r.toNumber()), 1000)
        assert.equal(await conditionalPaymentProcessor.getPayoutSlotCount(conditionId2).valueOf(), 3)
        await conditionalPaymentProcessor.splitPosition(etherToken.address, collectionId1, conditionId2, [0b10, 0b01, 0b100], 100, { from: player1 })
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId1, player1).then(r => r.toNumber()), 900)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId2, player1).then(r => r.toNumber()), 1000)

        // const collectionId3 = toHex(toBN(parseInt(collectionId1, 16)) + toBN(parseInt(keccak256(conditionId2 + padLeft(toHex(0b10), 64).slice(2)), 16)))
        const collectionId3 = toHex(toBN(collectionId1).add(toBN(keccak256(conditionId2 + padLeft(toHex(0b10), 64).slice(2)))))
        const collectionId4 = toHex(toBN(collectionId1).add(toBN(keccak256(conditionId2 + padLeft(toHex(0b01), 64).slice(2)))))
        
        // THIS IS REALLY REALLY WEIRD, WHY DOES IT ADD THE 1 HERE TO THE HASH??? (When it isn't sliced out there's a random 1 in here.)
        const collectionId5part1 = toHex(toBN(collectionId1).add(toBN(keccak256(conditionId2 + padLeft(toHex(0b100), 64).slice(2))))).substr(0, 2);
        const collectionId5part2 = toHex(toBN(collectionId1).add(toBN(keccak256(conditionId2 + padLeft(toHex(0b100), 64).slice(2))))).substr(3, this.length);
        const collectionId5 = collectionId5part1 + collectionId5part2;

        const positionId3 = keccak256(etherToken.address + collectionId3.slice(2))
        const positionId4 = keccak256(etherToken.address + collectionId4.slice(2))
        const positionId5 = keccak256(etherToken.address + collectionId5.slice(2))
        
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId3, player1).then(r => r.toNumber()), 100)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId4, player1).then(r => r.toNumber()), 100)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId5, player1).then(r => r.toNumber()), 100)

        await conditionalPaymentProcessor.splitPosition(etherToken.address, collectionId3, conditionId3, [0b10, 0b01, 0b100, 0b1000], 100, { from: player1 });
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId3, player1).then(r => r.toNumber()), 0)
        
        // I CANT FIGURE OUT WHY, THE ONLY PATTERN THAT I'VE FOUND IS LAST ROUND THE 1 SHOWED UP ON 0b100, WHICH IN THIS ROUND IS THE ONLY SPLIT THAT IT DIDN'T SHOW UP ON 
        const collectionId6part1 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b10), 64).slice(2))))).substr(0, 2)
        const collectionId6part2 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b10), 64).slice(2))))).substr(3, this.length)
        const collectionId6 = collectionId6part1 + collectionId6part2

        const collectionId7part1 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b01), 64).slice(2))))).substr(0, 2)
        const collectionId7part2 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b01), 64).slice(2))))).substr(3, this.length)
        const collectionId7 = collectionId7part1 + collectionId7part2
        
        const collectionId8 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b100), 64).slice(2)))))

        const collectionId9part1 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b1000), 64).slice(2))))).substr(0, 2)
        const collectionId9part2 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b1000), 64).slice(2))))).substr(3, this.length)
        const collectionId9 = collectionId9part1 + collectionId9part2;

        const positionId6 = keccak256(etherToken.address + collectionId6.slice(2))
        const positionId7 = keccak256(etherToken.address + collectionId7.slice(2))
        const positionId8 = keccak256(etherToken.address + collectionId8.slice(2))
        const positionId9 = keccak256(etherToken.address + collectionId9.slice(2))

        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId6, player1).then(r => r.toNumber()), 100)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId7, player1).then(r => r.toNumber()), 100)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId8, player1).then(r => r.toNumber()), 100)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId9, player1).then(r => r.toNumber()), 100)

        await conditionalPaymentProcessor.mergePositions(etherToken.address, collectionId3, conditionId3, [0b10, 0b01, 0b100, 0b1000], 50, { from: player1 });
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId6, player1).then(r => r.toNumber()), 50)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId7, player1).then(r => r.toNumber()), 50)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId8, player1).then(r => r.toNumber()), 50)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId9, player1).then(r => r.toNumber()), 50)

        try {
            await conditionalPaymentProcessor.mergePositions(etherToken.address, collectionId3, conditionId3, [0b10, 0b01, 0b100, 0b1000], 100, { from: player1 });
            assert.fail('The test didn\'t correctly fail when presented with an invalid merging of more tokens than the positions held');
        } catch(e) {
            assert(e);
        }

        try {
        await conditionalPaymentProcessor.mergePositions(etherToken.address, collectionId3, conditionId3, [0b10, 0b01, 0b1000], 100, { from: player1 });
            assert.fail('The test didn\'t correctly fail when presented with an invalid merging of more tokens than the positions held');
        } catch(e) {
            assert(e);
        }

        // AGAIN HERE
        await conditionalPaymentProcessor.mergePositions(etherToken.address, collectionId3, conditionId3, [0b10, 0b01, 0b1000], 50, { from: player1 })
        const collectionId10part1 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b1011), 64).slice(2))))).substr(0, 2)
        const collectionId10part2 = toHex(toBN(collectionId3).add(toBN(keccak256(conditionId3 + padLeft(toHex(0b1011), 64).slice(2))))).substr(3, this.length)
        const collectionId10 = collectionId10part1 + collectionId10part2;
        console.log(collectionId10);
        const positionId10 = keccak256(etherToken.address + collectionId10.slice(2))
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId10, player1).then(r => r.toNumber()), 50);

        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId6, player1).then(r => r.toNumber()), 0)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId7, player1).then(r => r.toNumber()), 0)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId8, player1).then(r => r.toNumber()), 50)
        assert.equal(await conditionalPaymentProcessor.balanceOf(positionId9, player1).then(r => r.toNumber()), 0)
    })

});

