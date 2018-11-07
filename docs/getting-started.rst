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


Getting Stake in Positions
--------------------------

Splitting and Merging Positions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Transferring Stake
~~~~~~~~~~~~~~~~~~


Moving to Deeper Positions
--------------------------


Oracle Reporting
----------------


Redeeming Positions
-------------------
