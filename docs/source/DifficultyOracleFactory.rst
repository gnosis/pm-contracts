-  `DifficultyOracleFactory <#difficultyoraclefactory>`__

   -  `Events <#difficultyoraclefactory-events>`__

      -  `DifficultyOracleCreation(\ *address* indexed ``creator``,
         *address* ``difficultyOracle``, *uint256*
         ``blockNumber``) <#difficultyoraclecreationaddress-indexed-creator-address-difficultyoracle-uint256-blocknumber>`__

   -  `Functions <#difficultyoraclefactory-functions>`__

      -  `createDifficultyOracle(\ *uint256*
         ``blockNumber``) <#createdifficultyoracleuint256-blocknumber>`__

DifficultyOracleFactory
=======================

Difficulty oracle factory contract - Allows to create difficulty oracle contracts
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: DifficultyOracleFactory()
-  This contract does **not** have a fallback function.

DifficultyOracleFactory Events
------------------------------

DifficultyOracleCreation(\ *address* indexed ``creator``, *address* ``difficultyOracle``, *uint256* ``blockNumber``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``83ecbb7b33dba848fcbd61d437ac02705db443e66f76ce6be0cf3415d07ab17f``

DifficultyOracleFactory Functions
---------------------------------

createDifficultyOracle(\ *uint256* ``blockNumber``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``9d5f2422``

Creates a new difficulty oracle contract

Inputs
^^^^^^

+-----------+-----------------+---------------------+
| type      | name            | description         |
+===========+=================+=====================+
| *uint256* | ``blockNumber`` | Target block number |
+-----------+-----------------+---------------------+

Outputs
^^^^^^^

+-----------+----------------------+-----------------+
| type      | name                 | description     |
+===========+======================+=================+
| *address* | ``difficultyOracle`` | Oracle contract |
+-----------+----------------------+-----------------+
