Gnosis Contracts Documentation
============================================
Collection of smart contracts for the Gnosis prediction market platform (https://www.gnosis.pm).
To interact with those contracts have a look at (https://github.com/gnosis/gnosis.js/).

Install
-------
Install requirements with npm:

``npm install``

Testing and Linting
-------------------
Run all tests (requires Node version >=7 for `async/await`, and will automatically run TestRPC in the background):

``npm test``

Run all tests matching a regexp pattern by setting the `TEST_GREP` environment variable:

``TEST_GREP='short selling' npm test``

Lint the JS:

``npm run lint``

Compile and Deploy
------------------
These commands apply to the RPC provider running on port 8545. You may want to have TestRPC running in the background. They are really wrappers around the [corresponding Truffle commands](http://truffleframework.com/docs/advanced/commands).

Compile all contracts to obtain ABI and bytecode:

``npm run compile``

Migrate all contracts required for the basic framework onto network associated with RPC provider:

``npm run migrate``

Network Artifacts
-----------------

Show the deployed addresses of all contracts on all networks:

``npm run networks``

Command line options for `truffle` can be passed down through NPM by preceding the options list with `--`.

For example, to clean network artifacts:

``npm run networks -- --clean``

Network artifacts from running migrations will contain addresses of deployed contracts on the Kovan and Rinkeby testnets.

Take network info from `networks.json` and inject it into contract build artifacts. This is done prepublish as well:

``npm run injectnetinfo``

Extract all network information into `networks.json`:

Be aware that this will clobber `networks.json`, so be careful with this command:

``npm run extractnetinfo``

Gas Measurements
----------------

Log gas measurements into `build/gas-stats.json`:

``npm run measuregasstats``

Documentation
-------------

There is a copy version hosted online at https://gnosis.github.io/gnosis-contracts/

Build docs with doxity:

``scripts/makedocs.sh``

Security and Liability
----------------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

License
-------
All smart contracts are released under GPL v.3.

Contributors
------------
- Stefan George (`Georgi87 <https://github.com/Georgi87>`_)
- Martin Koeppelmann (`koeppelmann <https://github.com/koeppelmann>`_)
- Alan Lu (`cag <https://github.com/cag>`_)
- Roland Kofler (`rolandkofler <https://github.com/rolandkofler>`_)
- Collin Chin (`collinc97 <https://github.com/collinc97>`_)
- Christopher Gewecke (`cgewecke <https://github.com/cgewecke>`_)

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   CampaignFactory
   Campaign
   CategoricalEvent
   CentralizedOracleFactory
   CentralizedOracle
   DifficultyOracleFactory
   DifficultyOracle
   EtherToken
   EventFactory
   Event
   FutarchyOracleFactory
   FutarchyOracle
   HumanFriendlyToken
   LMSRMarketMaker
   MajorityOracleFactory
   MajorityOracle
   MarketMaker
   Market
   Math
   Oracle
   OutcomeToken
   ScalarEvent
   SignedMessageOracleFactory
   SignedMessageOracle
   StandardMarketFactory
   StandardMarket
   StandardMarketWithPriceLoggerFactory
   StandardMarketWithPriceLogger
   StandardToken
   Token
   UltimateOracleFactory
   UltimateOracle
