Getting Started
===============

.. warning::

    This document refers to a version of the framework which is under development. Some things may change. You may also be interested in `v1`_ of this framework.

.. _v1: https://gnosis-pm-contracts.readthedocs.io/en/v1/

Prerequisites
-------------

Usage of this smart contract system requires knowledge of `Solidity`_. Additionally, this guide will assume a `Truffle`_ based setup.

The current state of this smart contract system may be found on `Github`_.

.. _Solidity: https://solidity.readthedocs.io
.. _Truffle: https://truffleframework.com
.. _Github: https://github.com/gnosis/pm-contracts

Installation
------------

Via NPM
~~~~~~~

This developmental framework may be installed from Github through NPM by running the following::

    npm i gnosis/pm-contracts


Preparing a Condition
---------------------

Before predictive assets can exist in the system, a *condition* must be prepared. A condition is a question to be answered in the future by a specific oracle in a particular manner. The following function may be used to prepare a condition:

.. autosolfunction:: ConditionalPaymentProcessor.prepareCondition

.. note:: It is up to the consumer of the contract to interpret the question ID correctly. For example, a client may interpret the question ID as an IPFS hash which can be used to retrieve a document specifying the question more fully. The meaning of the question ID is left up to clients.

If the function succeeds, the following event will be emitted, signifying the preparation of a condition:

.. autosolevent:: ConditionalPaymentProcessor.ConditionPreparation

.. note:: The condition ID is different from the question ID, and their distinction is important.

The successful preparation of a condition also initializes the following state variable:

.. autosolstatevar:: ConditionalPaymentProcessor.payoutNumerators

The resultant payout vector of a condition contains a predetermined number of *payout slots*. The entries of this vector are reported by the oracle, and their values sum up to one. This payout vector may be interpreted as the oracle's answer to the question posed in the condition.

A Categorical Example
~~~~~~~~~~~~~~~~~~~~~

Let's consider a question where only one out of multiple choices may be chosen:

    Who out of the following will be chosen?

    * Alice
    * Bob
    * Charlie

Through some commonly agreed upon mechanism, the detailed description for this question becomes strongly associated with a 32 byte question ID: ``0xabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc1234``

Let's also suppose we trust the oracle with address ``0x1337aBcdef1337abCdEf1337ABcDeF1337AbcDeF`` to deliver the answer for this question.

To prepare this condition, the following code gets run:

.. code-block:: js

    await conditionalPaymentProcessor.prepareCondition(
        '0x1337aBcdef1337abCdEf1337ABcDeF1337AbcDeF',
        '0xabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc1234',
        3
    )

The condition ID may also be determined from the parameters via:

.. code-block:: js

    web3.utils.soliditySha3({
        t: 'address',
        v: '0x1337aBcdef1337abCdEf1337ABcDeF1337AbcDeF'
    }, {
        t: 'bytes32',
        v: '0xabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc1234'
    }, {
        t: 'uint',
        v: 3
    })

This yields a condition ID of ``0x67eb23e8932765c1d7a094838c928476df8c50d1d3898f278ef1fb2a62afab63``.

Later, if the oracle ``0x1337aBcdef1337abCdEf1337ABcDeF1337AbcDeF`` makes a report that the payout vector for the condition is ``[0, 1, 0]``, the oracle essentially states that Bob was chosen, as the payout slot associated with Bob would receive all of the payout.

A Scalar Example
~~~~~~~~~~~~~~~~

Let us now consider a question where the answer may lie in a range:

    What will the score be? [0, 1000]

Let's say the question ID for this question is ``0x777def777def777def777def777def777def777def777def777def777def7890``, and that we trust the oracle ``0xCafEBAbECAFEbAbEcaFEbabECAfebAbEcAFEBaBe`` to deliver the results for this question.

To prepare this condition, the following code gets run:

.. code-block:: js

    await conditionalPaymentProcessor.prepareCondition(
        '0xCafEBAbECAFEbAbEcaFEbabECAfebAbEcAFEBaBe',
        '0x777def777def777def777def777def777def777def777def777def777def7890',
        2
    )

The condition ID for this condition can be calculated as ``0x3bdb7de3d0860745c0cac9c1dcc8e0d9cb7d33e6a899c2c298343ccedf1d66cf``.

In this case, the condition was created with two slots: one which represents the low end of the range (0) and another which represents the high end (1000). The slots' reported payout values should indicate how close the answer was to these endpoints. For example, if the oracle ``0xCafEBAbECAFEbAbEcaFEbabECAfebAbEcAFEBaBe`` makes a report that the payout vector is ``[9/10, 1/10]``, then the oracle essentially states that the score was 100, as the slot corresponding to the low end is worth nine times what the slot corresponding with the high end is worth, meaning the score should be nine times closer to 0 than it is close to 1000. Likewise, if the payout vector is reported to be ``[0, 1]``, then the oracle is saying that the score was *at least* 1000.


Payout Collections
------------------

The main concept for understanding the mechanics of this system is that of a *position*. We will build to this concept from conditions and payout slots, and then demonstrate the use of this concept.

However, before we can talk about positions, we first have to talk about *payout collections*, which may be defined like so:

    A nonempty proper subset of a condition’s payout slots which represents the sum total of all the contained slots’ payout values.

Categorical Example Featuring Alice, Bob, and Charlie
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

We'll denote the payout slots for Alice, Bob, and Charlie as ``A``, ``B``, and ``C`` respectively.

A valid payout collection may be ``(A|B)``. In this example, this payout collection represents the eventuality in which either Alice or Bob is chosen. Note that for a categorical condition, the payout vector which the oracle reports will eventually contain a one in exactly one of the three slots, so the sum of the values in Alice's and Bob's slots is one precisely when either Alice or Bob is chosen, and zero otherwise.

``(C)`` by itself is also a valid payout collection, and this simply represents the case where Charlie is chosen.

``()`` is an invalid payout collection, as it is empty. Empty payout collections do not make sense, as they would essentially represent no eventuality and have no value no matter what happens.

Conversely, ``(A|B|C)`` is also an invalid payout collection, as it is not a proper subset. Payout collections consisting of all the payout slots for a condition also do not make sense, as they would simply represent any eventuality, and should be equivalent to whatever was used to collateralize these payout collections.

Finally, payout slots from different conditions (e.g. ``(A|X)``) cannot be composed in a single payout collection.

Index Set Representation and Identifier Derivation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A payout collection may be represented by an a condition and an *index set*. This is a 256 bit array which denotes which payout slots are present in a payout collection. For example, the value ``3 == 0b011`` corresponds to the payout collection ``(A|B)``, whereas the value ``4 == 0b100`` corresponds to ``(C)``. Note that the indices start at the lowest bit in a ``uint``.

A payout collection may be identified with a 32 byte value called a *collection identifier*. In order to calculate the collection ID for ``(A|B)``, simply hash the condition ID and the index set:

.. code-block:: js

    web3.utils.soliditySha3({
        // See section "A Categorical Example" for derivation of this condition ID
        t: 'bytes32',
        v: '0x67eb23e8932765c1d7a094838c928476df8c50d1d3898f278ef1fb2a62afab63'
    }, {
        t: 'uint',
        v: 0b011 // Binary Number literals supported in newer versions of JavaScript
    })

This results in a collection ID of ``0x52ff54f0f5616e34a2d4f56fb68ab4cc636bf0d92111de74d1ec99040a8da118``.

We may also combine collection IDs for payout collections for different conditions by adding their values modulo 2^256 (equivalently, by adding their values and then taking the lowest 256 bits).

To illustrate, let's denote the slots for range ends 0 and 1000 from our scalar condition example as ``LO`` and ``HI``. We can find the collection ID for ``(LO)`` to be ``0xd79c1d3f71f6c9d998353ba2a848e596f0c6c1a9f6fa633f2c9ec65aaa097cdc``.

The combined collection ID for ``(A|B)&(LO)`` can be calculated via:

.. code-block:: js

    '0x' + BigInt.asUintN(256,
        0x52ff54f0f5616e34a2d4f56fb68ab4cc636bf0d92111de74d1ec99040a8da118n +
        0xd79c1d3f71f6c9d998353ba2a848e596f0c6c1a9f6fa633f2c9ec65aaa097cdcn
    ).toString(16)

.. note:: `BigInt`_ is used here for the calculation, though `BN.js`_ or `BigNumber.js`_ should both also suffice.

This calculation yields the value ``0x2a9b72306758380e3b0a31125ed39a635432b283180c41b3fe8b5f5eb4971df4``.

.. _BigInt: https://tc39.github.io/proposal-bigint/
.. _BN.js: https://github.com/indutny/bn.js/
.. _BigNumber.js: https://github.com/MikeMcl/bignumber.js/


Defining Positions
------------------

In order to define a position, we first need to designate a collateral token. This token must be an `ERC20`_ token which exists on the same chain as the ConditionalPaymentProcessor instance.

Then we need at least one condition with a payout collection, though a position may refer to multiple conditions each with an associated payout collection. Positions become valuable precisely when *all* of its constituent payout collections are valuable. More explicitly, the value of a position is a *product* of the values of those payout collections composing the position.

With these ingredients, position identifiers can also be calculated by hashing the address of the collateral token and the combined collection ID of all the payout collections in the position. We say positions are *deeper* if they contain more conditions and payout collections, and *shallower* if they contain less.

As an example, let's suppose that there is an ERC20 token called DollaCoin which exists at the address ``0xD011ad011ad011AD011ad011Ad011Ad011Ad011A``, and it is used as collateral for some positions. We will denote this token with ``$``.

We may calculate the position ID for the position ``$:(A|B)`` via:

.. code-block:: js

    web3.utils.soliditySha3({
        t: 'address',
        v: '0xD011ad011ad011AD011ad011Ad011Ad011Ad011A'
    }, {
        t: 'bytes32',
        v: '0x52ff54f0f5616e34a2d4f56fb68ab4cc636bf0d92111de74d1ec99040a8da118'
    })

The ID for ``$:(A|B)`` turns out to be ``0x6147e75d1048cea497aeee64d1a4777e286764ded497e545e88efc165c9fc4f0``.

Similarly, the ID for ``$:(LO)`` can be found to be ``0xfdad82d898904026ae6c01a5800c0a8ee9ada7e7862f9bb6428b6f81e06f53bb``, and ``$:(A|B)&(LO)`` has an ID of ``0xcc77e750b61d29e158aa3193faa3673b2686ba9f6a16f51b5cdbea2a4f694be0``.

.. _ERC20: https://theethereum.wiki/w/index.php/ERC20_Token_Standard


Splitting and Merging Positions
-------------------------------

Once conditions have been prepared, stake in positions contingent on these conditions may be obtained. Furthermore, this stake must be backed by collateral held by the system. In order to ensure this is the case, stake in shallow positions may only be created directly by sending collateral to the system for the system to hold, and stake in deeper positions may only be created by destroying stake in shallower positions. These processes are referred to respectively as *splitting a position* and *merging positions*.

To split a position, call the following function:

.. autosolfunction:: ConditionalPaymentProcessor.splitPosition


Querying and Transferring Stake
-------------------------------


Redeeming Positions
-------------------
