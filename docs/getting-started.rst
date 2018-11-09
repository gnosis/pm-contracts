Getting Started
===============

.. warning::

    This document refers to a version of the framework which is under development. Some things may change. You may also be interested in `v1`_ of this framework.

.. _v1: https://gnosis-pm-contracts.readthedocs.io/en/v1/

Prerequisites
-------------

Usage of this smart contract system requires knowledge of `Solidity <https://solidity.readthedocs.io>`_. Additionally, this guide will assume a `Truffle <https://truffleframework.com/>`_ based setup.

The current state of this smart contract system may be found on `Github <https://github.com/gnosis/pm-contracts>`_.


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


Positions
---------

The main concept for understanding the mechanics of this system is that of a *position*. We will build to this concept from conditions and payout slots, and then demonstrate the use of this concept.

Payout Collections
~~~~~~~~~~~~~~~~~~

Before we can talk about positions, we first have to talk about *payout collections*, which may be defined like so:

    A nonempty proper subset of a condition’s payout slots which represents the sum total of all the contained slots’ payout values.

Let us return to the example of our categorical condition with Alice, Bob, and Charlie.

We'll denote the payout slots for Alice, Bob, and Charlie as ``A``, ``B``, and ``C`` respectively.

A valid payout collection may be ``(A|B)``. In this example, this payout collection represents the eventuality in which either Alice or Bob is chosen. Note that for a categorical condition, the payout vector which the oracle reports will eventually contain a one in exactly one of the three slots, so the sum of the values in Alice's and Bob's slots is one precisely when either Alice or Bob is chosen.

``(C)`` by itself is also a valid payout collection, and this simply represents the case where Charlie is chosen.

``()`` is an invalid payout collection, as it is empty. Empty payout collections do not make sense, as they would essentially represent no eventuality and have no value no matter what happens.

Conversely, ``(A|B|C)`` is an invalid payout collection, as it is not a proper subset. Payout collections consisting of all the payout slots for a condition also do not make sense, as they would simply represent any eventuality, and should be equivalent to whatever was used to collateralize these payout collections.

Finally, payout slots from different conditions (e.g. ``(A|X)``) cannot be composed in a single payout collection.

Defining Positions
~~~~~~~~~~~~~~~~~~

Splitting and Merging Positions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Once conditions have been prepared, stake in positions contingent on the results of these conditions may be obtained. Furthermore, this stake must be backed by collateral held by the system. In order to ensure this is the case, stake in shallow positions may only be created directly by sending collateral to the system for the system to hold, and stake in deeper positions may only be created by destroying stake in shallower positions. These processes are referred to as splitting a position and merging positions.



Transferring Stake
~~~~~~~~~~~~~~~~~~


Redeeming Positions
-------------------
