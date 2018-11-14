const { assertRejects, getParamFromTxEvent } = require("./utils");
const { toHex, padLeft, keccak256, asciiToHex, toBN, fromWei } = web3.utils;

const ConditionalPaymentProcessor = artifacts.require(
  "ConditionalPaymentProcessor"
);
const WETH9 = artifacts.require("WETH9");

contract("ConditionalPaymentProcessor", function(accounts) {
  let etherToken;
  let oracle, questionId, outcomeSlotCount, conditionalPaymentProcessor;
  let conditionId;

  before(async () => {
    conditionalPaymentProcessor = await ConditionalPaymentProcessor.deployed();
    etherToken = await WETH9.deployed();

    // prepare condition
    oracle = accounts[1];

    questionId =
      "0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";
    outcomeSlotCount = 2;
    await conditionalPaymentProcessor.prepareCondition(
      oracle,
      questionId,
      outcomeSlotCount
    );

    conditionId = keccak256(
      oracle +
        [questionId, outcomeSlotCount]
          .map(v => padLeft(toHex(v), 64).slice(2))
          .join("")
    );
  });

  it("should have obtainable conditionIds if in possession of oracle, questionId, and outcomeSlotCount", async () => {
    assert.equal(
      (await conditionalPaymentProcessor.getOutcomeSlotCount(
        conditionId
      )).valueOf(),
      outcomeSlotCount
    );
    assert.equal(
      (await conditionalPaymentProcessor.payoutDenominator(
        conditionId
      )).valueOf(),
      0
    );
  });

  it("should not be able to prepare the same condition more than once", async () => {
    await assertRejects(
      conditionalPaymentProcessor.prepareCondition(
        oracle,
        questionId,
        outcomeSlotCount
      ),
      "Transaction should have reverted."
    );
  });

  it("should split and merge positions on outcome slots", async () => {
    const buyer = 0;
    const collateralTokenCount = 1e19;
    await etherToken.deposit({
      value: collateralTokenCount,
      from: accounts[buyer]
    });
    assert.equal(
      await etherToken.balanceOf.call(accounts[buyer]),
      collateralTokenCount
    );

    await etherToken.approve(
      conditionalPaymentProcessor.address,
      collateralTokenCount,
      { from: accounts[buyer] }
    );

    for (let i = 0; i < 10; i++) {
      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        asciiToHex(0),
        conditionId,
        [0b01, 0b10],
        collateralTokenCount / 10,
        { from: accounts[buyer] }
      );
    }

    assert.equal(
      await etherToken.balanceOf.call(conditionalPaymentProcessor.address),
      collateralTokenCount
    );
    assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0);

    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[buyer],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)
        )
      ),
      collateralTokenCount
    );
    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[buyer],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)
        )
      ),
      collateralTokenCount
    );

    // Validate getters
    assert.equal(
      await conditionalPaymentProcessor.getOutcomeSlotCount.call(conditionId),
      2
    );

    await conditionalPaymentProcessor.mergePositions(
      etherToken.address,
      asciiToHex(0),
      conditionId,
      [0b01, 0b10],
      collateralTokenCount,
      { from: accounts[buyer] }
    );
    assert.equal(
      await etherToken.balanceOf.call(accounts[buyer]),
      collateralTokenCount
    );
    assert.equal(
      await etherToken.balanceOf.call(conditionalPaymentProcessor.address),
      0
    );

    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[buyer],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)
        )
      ),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[buyer],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)
        )
      ),
      0
    );
  });

  it("should split positions, set outcome slot values, and redeem outcome tokens for conditions", async () => {
    // Mint payout slots
    const buyer = 2;
    const recipient = 7;
    const collateralTokenCount = 10;
    await etherToken.deposit({
      value: collateralTokenCount,
      from: accounts[buyer]
    });
    assert.equal(
      await etherToken.balanceOf.call(accounts[buyer]),
      collateralTokenCount
    );
    await etherToken.approve(
      conditionalPaymentProcessor.address,
      collateralTokenCount,
      { from: accounts[buyer] }
    );

    await conditionalPaymentProcessor.splitPosition(
      etherToken.address,
      asciiToHex(0),
      conditionId,
      [0b01, 0b10],
      collateralTokenCount,
      { from: accounts[buyer] }
    );
    assert.equal(
      (await etherToken.balanceOf.call(
        conditionalPaymentProcessor.address
      )).valueOf(),
      collateralTokenCount
    );
    assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0);

    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[buyer],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)
        )
      ),
      collateralTokenCount
    );
    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[buyer],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)
        )
      ),
      collateralTokenCount
    );

    // Set outcome in condition
    await conditionalPaymentProcessor.receiveResult(
      questionId,
      "0x" + [padLeft("3", 64), padLeft("7", 64)].join(""),
      { from: oracle }
    );
    assert.equal(
      await conditionalPaymentProcessor.payoutDenominator.call(conditionId),
      10
    );
    assert.equal(
      await conditionalPaymentProcessor.payoutNumerators.call(conditionId, 0),
      3
    );
    assert.equal(
      await conditionalPaymentProcessor.payoutNumerators.call(conditionId, 1),
      7
    );

    await conditionalPaymentProcessor.safeTransferFrom(
      accounts[buyer],
      accounts[recipient],
      keccak256(
        etherToken.address +
          keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)
      ),
      collateralTokenCount,
      "0x",
      { from: accounts[buyer] }
    );

    const buyerPayout = getParamFromTxEvent(
      await conditionalPaymentProcessor.redeemPositions(
        etherToken.address,
        asciiToHex(0),
        conditionId,
        [0b10],
        { from: accounts[buyer] }
      ),
      "payout"
    );

    assert.equal(buyerPayout.valueOf(), (collateralTokenCount * 7) / 10);
    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[recipient],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2)).slice(2)
        )
      ),
      collateralTokenCount
    );
    assert.equal(
      await conditionalPaymentProcessor.balanceOf.call(
        accounts[buyer],
        keccak256(
          etherToken.address +
            keccak256(conditionId + padLeft(toHex(0b10), 64).slice(2)).slice(2)
        )
      ),
      0
    );

    const recipientPayout = getParamFromTxEvent(
      await conditionalPaymentProcessor.redeemPositions(
        etherToken.address,
        asciiToHex(0),
        conditionId,
        [0b01],
        { from: accounts[recipient] }
      ),
      "payout"
    );

    assert.equal(
      (await etherToken.balanceOf.call(accounts[recipient])).toNumber(),
      recipientPayout.valueOf()
    );
    assert.equal(
      (await etherToken.balanceOf.call(accounts[buyer])).toNumber(),
      buyerPayout.valueOf()
    );
  });

  it("should redeem outcome tokens in more complex scenarios", async () => {
    // Setup a more complex scenario
    const _oracle = accounts[1];
    const _questionId =
      "0x1234567812345678123456781234567812345678123456781234567812345678";
    const _outcomeSlotCount = 4;
    await conditionalPaymentProcessor.prepareCondition(
      _oracle,
      _questionId,
      _outcomeSlotCount
    );
    const _conditionId = keccak256(
      _oracle +
        [_questionId, _outcomeSlotCount]
          .map(v => padLeft(toHex(v), 64).slice(2))
          .join("")
    );

    assert.equal(
      await conditionalPaymentProcessor.getOutcomeSlotCount(_conditionId),
      4
    );
    for (var i = 0; i < 4; i++) {
      assert.equal(
        (await conditionalPaymentProcessor.payoutNumerators(
          _conditionId,
          i
        )).valueOf(),
        0
      );
    }
    assert.equal(
      (await conditionalPaymentProcessor.payoutDenominator(
        _conditionId
      )).valueOf(),
      0
    );
    assert.notEqual(conditionId, _conditionId);

    // create some buyers and purchase collateralTokens and then some Outcome Slots
    const buyers = [3, 4, 5, 6];
    const collateralTokenCounts = [1e19, 1e9, 1e18, 1000];
    for (var i = 0; i < buyers.length; i++) {
      await etherToken.deposit({
        value: collateralTokenCounts[i],
        from: accounts[buyers[i]]
      });
      assert.equal(
        await etherToken
          .balanceOf(accounts[buyers[i]])
          .then(res => res.toString()),
        collateralTokenCounts[i]
      );
      await etherToken.approve(
        conditionalPaymentProcessor.address,
        collateralTokenCounts[i],
        { from: accounts[buyers[i]] }
      );
      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        asciiToHex(0),
        _conditionId,
        [0b0001, 0b0010, 0b0100, 0b1000],
        collateralTokenCounts[i],
        { from: accounts[buyers[i]] }
      );
    }

    await assertRejects(
      conditionalPaymentProcessor.receiveResult(
        _questionId,
        "0x" +
          [
            padLeft("14D", 64), // 333
            padLeft("29A", 64), // 666
            padLeft("1", 64), // 1
            padLeft("0", 64)
          ].join(""),
        { from: accounts[9] }
      ),
      "Transaction should have reverted."
    );

    // resolve the condition
    await conditionalPaymentProcessor.receiveResult(
      _questionId,
      "0x" +
        [
          padLeft("14D", 64), // 333
          padLeft("29A", 64), // 666
          padLeft("1", 64), // 1
          padLeft("0", 64)
        ].join(""),
      { from: _oracle }
    );
    assert.equal(
      await conditionalPaymentProcessor.payoutDenominator
        .call(_conditionId)
        .then(res => res.toString()),
      1000
    );

    // assert correct payouts for Outcome Slots
    const payoutsForPayoutSlots = [333, 666, 1, 0];
    for (var i = 0; i < buyers.length; i++) {
      assert.equal(
        await conditionalPaymentProcessor.balanceOf.call(
          accounts[buyers[i]],
          keccak256(
            etherToken.address +
              keccak256(
                _conditionId + padLeft(toHex(1 << i), 64).slice(2)
              ).slice(2)
          )
        ),
        collateralTokenCounts[i]
      );
      assert.equal(
        await conditionalPaymentProcessor.payoutNumerators(_conditionId, i),
        payoutsForPayoutSlots[i]
      );
      assert.equal(
        await conditionalPaymentProcessor.payoutDenominator(_conditionId),
        1000
      );
    }

    // assert Outcome Token redemption
    for (var i = 0; i < buyers.length; i++) {
      await conditionalPaymentProcessor.redeemPositions(
        etherToken.address,
        asciiToHex(0),
        _conditionId,
        [0b0001, 0b0010, 0b0100, 0b1000],
        { from: accounts[buyers[i]] }
      );
      assert.equal(
        await etherToken
          .balanceOf(accounts[buyers[i]])
          .then(res => res.toString()),
        collateralTokenCounts[i]
      );
    }
  });
});

contract("Complex splitting and merging scenario #1.", function(accounts) {
  let conditionalPaymentProcessor,
    etherToken,
    oracle1,
    oracle2,
    oracle3,
    questionId1,
    questionId2,
    questionId3,
    outcomeSlotCount1,
    outcomeSlotCount2,
    outcomeSlotCount3,
    player1,
    player2,
    player3,
    conditionId1,
    conditionId2,
    conditionId3;

  before(async () => {
    conditionalPaymentProcessor = await ConditionalPaymentProcessor.deployed();
    etherToken = await WETH9.deployed();

    // prepare condition
    oracle1 = accounts[1];
    oracle2 = accounts[2];
    oracle3 = accounts[3];

    questionId1 =
      "0x1234987612349876123498761234987612349876123498761234987612349876";
    questionId2 =
      "0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";
    questionId3 =
      "0xab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12";

    outcomeSlotCount1 = 2;
    outcomeSlotCount2 = 3;
    outcomeSlotCount3 = 4;

    player1 = accounts[4];
    player2 = accounts[5];
    player3 = accounts[6];

    await conditionalPaymentProcessor.prepareCondition(
      oracle1,
      questionId1,
      outcomeSlotCount1
    );
    await conditionalPaymentProcessor.prepareCondition(
      oracle2,
      questionId2,
      outcomeSlotCount2
    );
    await conditionalPaymentProcessor.prepareCondition(
      oracle3,
      questionId3,
      outcomeSlotCount3
    );

    conditionId1 = keccak256(
      oracle1 +
        [questionId1, outcomeSlotCount1]
          .map(v => padLeft(toHex(v), 64).slice(2))
          .join("")
    );
    conditionId2 = keccak256(
      oracle2 +
        [questionId2, outcomeSlotCount2]
          .map(v => padLeft(toHex(v), 64).slice(2))
          .join("")
    );
    conditionId3 = keccak256(
      oracle3 +
        [questionId3, outcomeSlotCount3]
          .map(v => padLeft(toHex(v), 64).slice(2))
          .join("")
    );

    await etherToken.deposit({ value: 10000, from: player1 });
    await etherToken.approve(conditionalPaymentProcessor.address, 10000, {
      from: player1
    });
    await etherToken.deposit({ value: 10000, from: player2 });
    await etherToken.approve(conditionalPaymentProcessor.address, 10000, {
      from: player2
    });
    await etherToken.deposit({ value: 10000, from: player3 });
    await etherToken.approve(conditionalPaymentProcessor.address, 10000, {
      from: player3
    });
  });

  it("Invalid initial positions should not give any outcome tokens", async () => {
    await conditionalPaymentProcessor.splitPosition(
      etherToken.address,
      asciiToHex(0),
      conditionId1,
      [0b01],
      1e19,
      { from: player1 }
    );

    assert.equal(
      await conditionalPaymentProcessor.balanceOf(
        player1,
        keccak256(
          etherToken.address,
          0 +
            keccak256(conditionId1, padLeft(toHex(0b01), 64).slice(2)).slice(2)
        )
      ),
      0
    );
    assert.equal(
      await etherToken.balanceOf.call(player1).then(res => res.toString()),
      10000
    );

    await assertRejects(
      conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        0,
        conditionId1,
        [0b01, 0b111],
        1e19,
        { from: player1 }
      ),
      "Worked with an invalid indexSet."
    );
    await assertRejects(
      conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        0,
        conditionId1,
        [0b01, 0b11],
        1e19,
        { from: player1 }
      ),
      "Worked with an invalid indexSet."
    );
    await assertRejects(
      conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        0,
        conditionId1,
        [0b01, 0b11, 0b0],
        1e19,
        { from: player1 }
      ),
      "Worked with an invalid indexSet."
    );
  });

  it("should not produce any position changes when split on an incomplete set of base conditions", async () => {
    await conditionalPaymentProcessor.splitPosition(
      etherToken.address,
      asciiToHex(0),
      conditionId1,
      [0b10],
      1,
      { from: player3 }
    );
    await conditionalPaymentProcessor.splitPosition(
      etherToken.address,
      asciiToHex(0),
      conditionId1,
      [0b01],
      1,
      { from: player3 }
    );
    const collectionId1 = keccak256(
      conditionId1 + padLeft(toHex(0b01), 64).slice(2)
    );
    const collectionId2 = keccak256(
      conditionId1 + padLeft(toHex(0b10), 64).slice(2)
    );
    const positionId1 = keccak256(etherToken.address + collectionId1.slice(2));
    const positionId2 = keccak256(etherToken.address + collectionId2.slice(2));

    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player3, positionId1)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player3, positionId2)
        .then(r => r.toNumber()),
      0
    );
  });

  it("should not be able to merge back into a collateral token from a position without any outcome tokens", async () => {
    await assertRejects(
      conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        asciiToHex(0),
        conditionId1,
        [0b01, 0b10],
        1,
        { from: player3 }
      ),
      "If this didn't fail, the user is somehow able to withdraw ethereum from positions with none in it, or they have already ether in that position"
    );

    const collectionId1 = keccak256(
      conditionId1 + padLeft(toHex(0b01), 64).slice(2)
    );
    const collectionId2 = keccak256(
      conditionId1 + padLeft(toHex(0b10), 64).slice(2)
    );
    const positionId1 = keccak256(etherToken.address + collectionId1.slice(2));
    const positionId2 = keccak256(etherToken.address + collectionId2.slice(2));

    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player3, positionId1)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player3, positionId2)
        .then(r => r.toNumber()),
      0
    );
  });

  it("Should be able to split and merge in more complex scenarios", async () => {
    // Split on an initial condition
    await conditionalPaymentProcessor.splitPosition(
      etherToken.address,
      asciiToHex(0),
      conditionId1,
      [0b01, 0b10],
      1000,
      { from: player1 }
    );

    const collectionId1 = keccak256(
      conditionId1 + padLeft(toHex(0b01), 64).slice(2)
    );
    const collectionId2 = keccak256(
      conditionId1 + padLeft(toHex(0b10), 64).slice(2)
    );
    const positionId1 = keccak256(etherToken.address + collectionId1.slice(2));
    const positionId2 = keccak256(etherToken.address + collectionId2.slice(2));

    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId1)
        .then(r => r.toNumber()),
      1000
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId2)
        .then(r => r.toNumber()),
      1000
    );
    assert.equal(
      await conditionalPaymentProcessor
        .getOutcomeSlotCount(conditionId2)
        .valueOf(),
      3
    );

    // Split on a non-root Collection Identifier and Condition
    await conditionalPaymentProcessor.splitPosition(
      etherToken.address,
      collectionId1,
      conditionId2,
      [0b10, 0b01, 0b100],
      100,
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId1)
        .then(r => r.toNumber()),
      900
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId2)
        .then(r => r.toNumber()),
      1000
    );

    const collectionId3 =
      "0x" +
      toHex(
        toBN(collectionId1).add(
          toBN(keccak256(conditionId2 + padLeft(toHex(0b10), 64).slice(2)))
        )
      ).slice(-64);
    const collectionId4 =
      "0x" +
      toHex(
        toBN(collectionId1).add(
          toBN(keccak256(conditionId2 + padLeft(toHex(0b01), 64).slice(2)))
        )
      ).slice(-64);
    const collectionId5 =
      "0x" +
      toHex(
        toBN(collectionId1).add(
          toBN(keccak256(conditionId2 + padLeft(toHex(0b100), 64).slice(2)))
        )
      ).slice(-64);
    const positionId3 = keccak256(etherToken.address + collectionId3.slice(2));
    const positionId4 = keccak256(etherToken.address + collectionId4.slice(2));
    const positionId5 = keccak256(etherToken.address + collectionId5.slice(2));

    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      100
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId4)
        .then(r => r.toNumber()),
      100
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId5)
        .then(r => r.toNumber()),
      100
    );

    // Split again on a non-root Collection Identifier and Condition
    await conditionalPaymentProcessor.splitPosition(
      etherToken.address,
      collectionId3,
      conditionId3,
      [0b10, 0b01, 0b100, 0b1000],
      100,
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId2)
        .then(r => r.toNumber()),
      1000
    );

    const collectionId6 =
      "0x" +
      toHex(
        toBN(collectionId3).add(
          toBN(keccak256(conditionId3 + padLeft(toHex(0b10), 64).slice(2)))
        )
      ).slice(-64);
    const collectionId7 =
      "0x" +
      toHex(
        toBN(collectionId3).add(
          toBN(keccak256(conditionId3 + padLeft(toHex(0b01), 64).slice(2)))
        )
      ).slice(-64);
    const collectionId8 =
      "0x" +
      toHex(
        toBN(collectionId3).add(
          toBN(keccak256(conditionId3 + padLeft(toHex(0b100), 64).slice(2)))
        )
      ).slice(-64);
    const collectionId9 =
      "0x" +
      toHex(
        toBN(collectionId3).add(
          toBN(keccak256(conditionId3 + padLeft(toHex(0b1000), 64).slice(2)))
        )
      ).slice(-64);
    const positionId6 = keccak256(etherToken.address + collectionId6.slice(2));
    const positionId7 = keccak256(etherToken.address + collectionId7.slice(2));
    const positionId8 = keccak256(etherToken.address + collectionId8.slice(2));
    const positionId9 = keccak256(etherToken.address + collectionId9.slice(2));

    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId6)
        .then(r => r.toNumber()),
      100
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId7)
        .then(r => r.toNumber()),
      100
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId8)
        .then(r => r.toNumber()),
      100
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId9)
        .then(r => r.toNumber()),
      100
    );

    // Merge a full set of Outcome Slots back into conditionId3
    await conditionalPaymentProcessor.mergePositions(
      etherToken.address,
      collectionId3,
      conditionId3,
      [0b10, 0b01, 0b100, 0b1000],
      50,
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId6)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId7)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId8)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId9)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      50
    );

    // Merge a partial set of Outcome Slots back
    await conditionalPaymentProcessor.mergePositions(
      etherToken.address,
      collectionId3,
      conditionId3,
      [0b10, 0b01, 0b1000],
      50,
      { from: player1 }
    );
    const collectionId10 =
      "0x" +
      toHex(
        toBN(collectionId3).add(
          toBN(keccak256(conditionId3 + padLeft(toHex(0b1011), 64).slice(2)))
        )
      ).slice(-64);
    const positionId10 = keccak256(
      etherToken.address + collectionId10.slice(2)
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId10)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId6)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId7)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId8)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId9)
        .then(r => r.toNumber()),
      0
    );

    await assertRejects(
      conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        collectionId3,
        conditionId3,
        [0b10, 0b01, 0b100, 0b1000],
        100,
        { from: player1 }
      ),
      "Invalid merging of more tokens than the positions held did not revent"
    );
    await assertRejects(
      conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        collectionId3,
        conditionId3,
        [0b10, 0b01, 0b1000],
        100,
        { from: player1 }
      ),
      "Invalid merging of tokens amounting to more than the positions held happened."
    );

    await conditionalPaymentProcessor.mergePositions(
      etherToken.address,
      collectionId3,
      conditionId3,
      [0b1011, 0b100],
      25,
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId8)
        .then(r => r.toNumber()),
      25
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId10)
        .then(r => r.toNumber()),
      25
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      75
    );

    await assertRejects(
      conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        collectionId1,
        conditionId2,
        [0b01, 0b10, 0b100],
        100,
        { from: player1 }
      ),
      "it didn't revert when only partial positions in the set have enough outcomeTokens."
    );

    await conditionalPaymentProcessor.mergePositions(
      etherToken.address,
      collectionId1,
      conditionId2,
      [0b01, 0b10, 0b100],
      50,
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId1)
        .then(r => r.toNumber()),
      950
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      25
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId4)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId5)
        .then(r => r.toNumber()),
      50
    );

    await assertRejects(
      conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        0,
        conditionId1,
        [0b01],
        100,
        { from: player1 }
      ),
      "Should not merge proper positions back into collateralTokens"
    );
    await assertRejects(
      conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        0,
        conditionId1,
        [0b01, 0b10],
        1000,
        { from: player1 }
      ),
      "Should not merge positions that dont hold enough value specified back into collateralTokens"
    );
    await assertRejects(
      conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        0,
        conditionId1,
        [0b01, 0b10],
        950,
        { from: player3 }
      ),
      "Should not merge positions from the wrong player back into collateralTokens"
    );

    await conditionalPaymentProcessor.mergePositions(
      etherToken.address,
      asciiToHex(0),
      conditionId1,
      [0b01, 0b10],
      950,
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId1)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId2)
        .then(r => r.toNumber()),
      50
    );
    assert.equal(
      await etherToken.balanceOf(player1).then(r => r.toNumber()),
      9950
    );

    await assertRejects(
      conditionalPaymentProcessor.redeemPositions(
        etherToken.address,
        asciiToHex(0),
        conditionId1,
        [0b01, 0b10],
        { from: player1 }
      ),
      "The position is being redeemed before the payouts for the condition have been set."
    );

    await conditionalPaymentProcessor.receiveResult(
      questionId3,
      "0x" +
        [
          padLeft("14D", 64), // 333
          padLeft("1", 64), // 1
          padLeft("29A", 64), // 666
          padLeft("0", 64)
        ].join(""),
      { from: oracle3 }
    );

    assert.equal(
      await conditionalPaymentProcessor
        .payoutDenominator(conditionId3)
        .valueOf(),
      1000
    );
    await assertRejects(
      conditionalPaymentProcessor.redeemPositions(
        etherToken.address,
        asciiToHex(0),
        conditionId2,
        [0b01, 0b110],
        { from: player1 }
      ),
      "The position is being redeemed before the payouts for the condition have been set."
    );

    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId10)
        .then(r => r.toNumber()),
      25
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId6)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId7)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId8)
        .then(r => r.toNumber()),
      25
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId9)
        .then(r => r.toNumber()),
      0
    );

    // asserts that if you redeem the wrong indexSets, it won't affect the other indexes.
    await conditionalPaymentProcessor.redeemPositions(
      etherToken.address,
      collectionId3,
      conditionId3,
      [0b10, 0b01, 0b1000],
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId8)
        .then(r => r.toNumber()),
      25
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      25
    );

    await conditionalPaymentProcessor.redeemPositions(
      etherToken.address,
      collectionId3,
      conditionId3,
      [0b10, 0b01, 0b100],
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId8)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      25 + Math.floor(25 * (666 / 1000))
    );

    await conditionalPaymentProcessor.redeemPositions(
      etherToken.address,
      collectionId3,
      conditionId3,
      [0b1011],
      { from: player1 }
    );

    // We have to account for a small fraction of tokens getting stuck in the contract there on payout
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      25 + Math.floor(25 * (666 / 1000 + 334 / 1000)) - 1
    );

    await conditionalPaymentProcessor.receiveResult(
      questionId2,
      "0x" + [padLeft("FF", 64), padLeft("FF", 64), padLeft("0", 64)].join(""),
      { from: oracle2 }
    );

    await conditionalPaymentProcessor.redeemPositions(
      etherToken.address,
      collectionId1,
      conditionId2,
      [0b01, 0b10, 0b100],
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId3)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId4)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId5)
        .then(r => r.toNumber()),
      0
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId1)
        .then(r => r.toNumber()),
      49
    );

    await conditionalPaymentProcessor.receiveResult(
      questionId1,
      "0x" + [padLeft("1", 64), padLeft("0", 64)].join(""),
      { from: oracle1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .payoutDenominator(conditionId1)
        .valueOf(),
      1
    );

    await conditionalPaymentProcessor.redeemPositions(
      etherToken.address,
      asciiToHex(0),
      conditionId1,
      [0b01],
      { from: player1 }
    );
    assert.equal(
      await conditionalPaymentProcessor
        .balanceOf(player1, positionId1)
        .then(r => r.toNumber()),
      0
    );

    // Missing 1 for the rounding of different outcomes
    assert.equal(
      await etherToken.balanceOf(player1).then(r => r.toNumber()),
      9999
    );
  });
});

contract(
  "Should be able to partially split and merge in complex scenarios. #2",
  function(accounts) {
    let conditionalPaymentProcessor,
      etherToken,
      oracle1,
      oracle2,
      oracle3,
      questionId1,
      questionId2,
      questionId3,
      outcomeSlotCount1,
      outcomeSlotCount2,
      outcomeSlotCount3,
      player1,
      player2,
      player3,
      conditionId1,
      conditionId2,
      conditionId3;

    before(async () => {
      conditionalPaymentProcessor = await ConditionalPaymentProcessor.deployed();
      etherToken = await WETH9.deployed();

      // prepare condition
      oracle1 = accounts[1];
      oracle2 = accounts[2];
      oracle3 = accounts[3];

      questionId1 =
        "0x1234987612349876123498761234987612349876123498761234987612349876";
      questionId2 =
        "0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";
      questionId3 =
        "0xab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12";

      outcomeSlotCount1 = 2;
      outcomeSlotCount2 = 3;
      outcomeSlotCount3 = 4;

      player1 = accounts[4];
      player2 = accounts[5];
      player3 = accounts[6];

      await conditionalPaymentProcessor.prepareCondition(
        oracle1,
        questionId1,
        outcomeSlotCount1
      );
      await conditionalPaymentProcessor.prepareCondition(
        oracle2,
        questionId2,
        outcomeSlotCount2
      );
      await conditionalPaymentProcessor.prepareCondition(
        oracle3,
        questionId3,
        outcomeSlotCount3
      );

      conditionId1 = keccak256(
        oracle1 +
          [questionId1, outcomeSlotCount1]
            .map(v => padLeft(toHex(v), 64).slice(2))
            .join("")
      );
      conditionId2 = keccak256(
        oracle2 +
          [questionId2, outcomeSlotCount2]
            .map(v => padLeft(toHex(v), 64).slice(2))
            .join("")
      );
      conditionId3 = keccak256(
        oracle3 +
          [questionId3, outcomeSlotCount3]
            .map(v => padLeft(toHex(v), 64).slice(2))
            .join("")
      );

      await etherToken.deposit({ value: 1e19, from: player1 });
      await etherToken.approve(conditionalPaymentProcessor.address, 1e19, {
        from: player1
      });
      await etherToken.deposit({ value: 1e19, from: player2 });
      await etherToken.approve(conditionalPaymentProcessor.address, 1e19, {
        from: player2
      });
      await etherToken.deposit({ value: 1e19, from: player3 });
      await etherToken.approve(conditionalPaymentProcessor.address, 1e19, {
        from: player3
      });
    });

    it("Should correctly and safely partially split and merge in complex scnarios.", async () => {
      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        asciiToHex(0),
        conditionId1,
        [0b01, 0b10],
        1e19,
        { from: player1 }
      );

      const collectionId1 = keccak256(
        conditionId1 + padLeft(toHex(0b01), 64).slice(2)
      );
      const collectionId2 = keccak256(
        conditionId1 + padLeft(toHex(0b10), 64).slice(2)
      );
      const positionId1 = keccak256(
        etherToken.address + collectionId1.slice(2)
      );
      const positionId2 = keccak256(
        etherToken.address + collectionId2.slice(2)
      );

      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId1),
          "ether"
        ),
        10
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId2),
          "ether"
        ),
        10
      );
      assert.equal(fromWei(await etherToken.balanceOf(player1), "ether"), 0);

      await assertRejects(
        conditionalPaymentProcessor.splitPosition(
          etherToken.address,
          collectionId2,
          conditionId2,
          [0b01, 0b10],
          1000,
          { from: player1 }
        ),
        "partial split without having the added positions (3) tokens should be rejected"
      );

      await assertRejects(
        conditionalPaymentProcessor.splitPosition(
          etherToken.address,
          collectionId2,
          conditionId2,
          [0b100, 0b01],
          1000,
          { from: player1 }
        ),
        "should be rejected"
      );

      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        collectionId2,
        conditionId2,
        [0b110, 0b01],
        1e19,
        { from: player1 }
      );
      const collectionId3 =
        "0x" +
        toHex(
          toBN(collectionId2).add(
            toBN(keccak256(conditionId2 + padLeft(toHex(0b110), 64).slice(2)))
          )
        ).slice(-64);
      const collectionId4 =
        "0x" +
        toHex(
          toBN(collectionId2).add(
            toBN(keccak256(conditionId2 + padLeft(toHex(0b01), 64).slice(2)))
          )
        ).slice(-64);
      const positionId3 = keccak256(
        etherToken.address + collectionId3.slice(2)
      );
      const positionId4 = keccak256(
        etherToken.address + collectionId4.slice(2)
      );

      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId3),
          "ether"
        ),
        10
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId4),
          "ether"
        ),
        10
      );

      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        collectionId2,
        conditionId2,
        [0b100, 0b10],
        1e19,
        { from: player1 }
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId3),
          "ether"
        ),
        0
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId4),
          "ether"
        ),
        10
      );

      const collectionId5 =
        "0x" +
        toHex(
          toBN(collectionId2).add(
            toBN(keccak256(conditionId2 + padLeft(toHex(0b100), 64).slice(2)))
          )
        ).slice(-64);
      const collectionId6 =
        "0x" +
        toHex(
          toBN(collectionId2).add(
            toBN(keccak256(conditionId2 + padLeft(toHex(0b10), 64).slice(2)))
          )
        ).slice(-64);
      const positionId5 = keccak256(
        etherToken.address + collectionId5.slice(2)
      );
      const positionId6 = keccak256(
        etherToken.address + collectionId6.slice(2)
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId5),
          "ether"
        ),
        10
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId6),
          "ether"
        ),
        10
      );

      await conditionalPaymentProcessor.mergePositions(
        etherToken.address,
        collectionId2,
        conditionId2,
        [0b01, 0b10],
        1e19,
        { from: player1 }
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId6),
          "ether"
        ),
        0
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId4),
          "ether"
        ),
        0
      );

      const collectionId7 =
        "0x" +
        toHex(
          toBN(collectionId2).add(
            toBN(keccak256(conditionId2 + padLeft(toHex(0b11), 64).slice(2)))
          )
        ).slice(-64);
      const positionId7 = keccak256(
        etherToken.address + collectionId7.slice(2)
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId7),
          "ether"
        ),
        10
      );
    });
  }
);

contract(
  "The same positions in different orders should equal each other.",
  function(accounts) {
    let conditionalPaymentProcessor,
      etherToken,
      oracle1,
      oracle2,
      oracle3,
      questionId1,
      questionId2,
      questionId3,
      outcomeSlotCount1,
      outcomeSlotCount2,
      outcomeSlotCount3,
      player1,
      player2,
      player3,
      conditionId1,
      conditionId2,
      conditionId3;

    before(async () => {
      conditionalPaymentProcessor = await ConditionalPaymentProcessor.deployed();
      etherToken = await WETH9.deployed();

      // prepare condition
      oracle1 = accounts[1];
      oracle2 = accounts[2];
      oracle3 = accounts[3];

      questionId1 =
        "0x1234987612349876123498761234987612349876123498761234987612349876";
      questionId2 =
        "0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";
      questionId3 =
        "0xab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12";

      outcomeSlotCount1 = 2;
      outcomeSlotCount2 = 3;
      outcomeSlotCount3 = 4;

      player1 = accounts[4];
      player2 = accounts[5];
      player3 = accounts[6];

      await conditionalPaymentProcessor.prepareCondition(
        oracle1,
        questionId1,
        outcomeSlotCount1
      );
      await conditionalPaymentProcessor.prepareCondition(
        oracle2,
        questionId2,
        outcomeSlotCount2
      );
      await conditionalPaymentProcessor.prepareCondition(
        oracle3,
        questionId3,
        outcomeSlotCount3
      );

      conditionId1 = keccak256(
        oracle1 +
          [questionId1, outcomeSlotCount1]
            .map(v => padLeft(toHex(v), 64).slice(2))
            .join("")
      );
      conditionId2 = keccak256(
        oracle2 +
          [questionId2, outcomeSlotCount2]
            .map(v => padLeft(toHex(v), 64).slice(2))
            .join("")
      );
      conditionId3 = keccak256(
        oracle3 +
          [questionId3, outcomeSlotCount3]
            .map(v => padLeft(toHex(v), 64).slice(2))
            .join("")
      );

      await etherToken.deposit({ value: 1e19, from: player1 });
      await etherToken.approve(conditionalPaymentProcessor.address, 1e19, {
        from: player1
      });
      await etherToken.deposit({ value: 1e19, from: player2 });
      await etherToken.approve(conditionalPaymentProcessor.address, 1e19, {
        from: player2
      });
      await etherToken.deposit({ value: 1e19, from: player3 });
      await etherToken.approve(conditionalPaymentProcessor.address, 1e19, {
        from: player3
      });
    });

    it("Should create positions in opposite orders that equal each others values", async () => {
      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        asciiToHex(0),
        conditionId1,
        [0b01, 0b10],
        1e18,
        { from: player1 }
      );
      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        asciiToHex(0),
        conditionId2,
        [0b01, 0b10, 0b100],
        1e18,
        { from: player1 }
      );

      const collectionId1 = keccak256(
        conditionId1 + padLeft(toHex(0b01), 64).slice(2)
      );
      const collectionId2 = keccak256(
        conditionId1 + padLeft(toHex(0b10), 64).slice(2)
      );
      const positionId1 = keccak256(
        etherToken.address + collectionId1.slice(2)
      );
      const positionId2 = keccak256(
        etherToken.address + collectionId2.slice(2)
      );

      const collectionId3 = keccak256(
        conditionId2 + padLeft(toHex(0b01), 64).slice(2)
      );
      const collectionId4 = keccak256(
        conditionId2 + padLeft(toHex(0b10), 64).slice(2)
      );
      const collectionId5 = keccak256(
        conditionId2 + padLeft(toHex(0b100), 64).slice(2)
      );
      const positionId3 = keccak256(
        etherToken.address + collectionId3.slice(2)
      );
      const positionId4 = keccak256(
        etherToken.address + collectionId4.slice(2)
      );
      const positionId5 = keccak256(
        etherToken.address + collectionId5.slice(2)
      );

      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId1),
          "ether"
        ),
        1
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId2),
          "ether"
        ),
        1
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId3),
          "ether"
        ),
        1
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId4),
          "ether"
        ),
        1
      );
      assert.equal(
        fromWei(
          await conditionalPaymentProcessor.balanceOf(player1, positionId5),
          "ether"
        ),
        1
      );

      assert.equal(fromWei(await etherToken.balanceOf(player1), "ether"), 8);

      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        collectionId1,
        conditionId2,
        [0b10, 0b01, 0b100],
        1e18,
        { from: player1 }
      );
      await conditionalPaymentProcessor.splitPosition(
        etherToken.address,
        collectionId4,
        conditionId1,
        [0b10, 0b01],
        1e18,
        { from: player1 }
      );
      // PositionId1 split on (PositionId4) should equal (PositionId4) split on PositionId1
      const collectionId6 =
        "0x" +
        toHex(
          toBN(collectionId1).add(
            toBN(keccak256(conditionId2 + padLeft(toHex(0b10), 64).slice(2)))
          )
        ).slice(-64);
      const positionId6 = keccak256(
        etherToken.address + collectionId6.slice(2)
      );

      const collectionId7 =
        "0x" +
        toHex(
          toBN(collectionId4).add(
            toBN(keccak256(conditionId1 + padLeft(toHex(0b01), 64).slice(2)))
          )
        ).slice(-64);
      const positionId7 = keccak256(
        etherToken.address + collectionId7.slice(2)
      );

      assert.equal(positionId6, positionId7);
    });
  }
);
