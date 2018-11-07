Changes from Version 1.x
========================

Documentation for the first version of the prediction market contract framework can be found `here <https://gnosis-pm-contracts.readthedocs.io/en/v1/>`_, or via the menu on the sidebar.


Modular vs Monolithic
---------------------

Modular smart contracts composed v1 of the framework. Various factories for the smart contracts which were integral parts of the system had canonical locations on chain, but were not strictly necessary for using the framework.

In contrast, this version collects all core functionality and storage requirements of prediction markets into a single monolithic instance. Although the property of modularity typically is desired in software projects, on the chain it also comes with the overhead of message passing between contract instances and duplicate code deployments. Consequently, a monolithic design can produce significant gas savings for users of the system.

Furthermore, this aggregation of prediction market data allows for advanced on-chain support of conditional markets.


From Events to Conditions
-------------------------

In v1, the contracts used the term *event* to refer to future events to be resolved by an oracle. These events were represented by contract instances initialized with a nonstandard oracle contract instance and a collateral token address.

Each oracle contract instance was expected to report on a single specific future event. Once the report is ready, the event contract must be notified to pull the result from the oracle.

Furthermore, since event contract instances are tied to single collateral token addresses, a new event contract instance would have to be deployed if support for a different type of collateral token is desired.

The nomenclature clashed with Solidity's use of ``event``, which indicated the definition of a class of EVM logs consumers of contracts could expect to be emitted during transactions with the contract.

In v2, future events to be resolved by an oracle are referred to as *conditions*. These conditions are defined by an oracle account, a question ID, and a payout slot count.

Any account, whether externally owned or a contract, may act as an oracle. The oracle simply reports the result of the specific question about a future event, which should be retrievable from the question ID, to the monolith.

Because there's no reference to any collateral token in the specification of a condition, the report for the condition applies for all concievable collateral tokens.


Peripheral Contracts
--------------------

Markets and MarketMakers from v1 are considered not core functionality, and will be moved into dependant packages. The mechanism for CentralizedOracles can now be implemented by regular externally owned accounts. Similarly, MajorityOracles can now be implemented by your preferred multisignature wallets. The FutarchyOracle mechanism is planned to be ported to the new contract system in a separate dependent package. There are no plans to continue support of the Campaign mechanism.
