MajorityOracleFactory
=====================

-  `MajorityOracleFactory <#majorityoraclefactory>`__

   -  `Events <#events>`__

      -  `MajorityOracleCreation <#majorityoraclecreation-address-indexed-creator-address-majorityoracle-address-oracles>`__\ (*address*
         indexed ``creator``, *address* ``majorityOracle``, *address[]*
         ``oracles``)

   -  `Functions <#functions>`__

      -  `createMajorityOracle <#createmajorityoracle-address-oracles>`__\ (*address[]*
         ``oracles``)

Majority oracle factory contract - Allows to create majority oracle contracts
-----------------------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: MajorityOracleFactory()
-  This contract does **not** have a fallback function.

Events
------

MajorityOracleCreation(\ *address* indexed ``creator``, *address* ``majorityOracle``, *address[]* ``oracles``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``df1eeefc4815bdd1bdf45905c4ce59f6ca50efb4148303c9bbda2bff40301d3d``

Functions
---------

createMajorityOracle(\ *address[]* ``oracles``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``e04c0c52``

Creates a new majority oracle contract

Inputs
^^^^^^

+-------------+-------------+--------------------------------------------------+
| type        | name        | description                                      |
+=============+=============+==================================================+
| *address[]* | ``oracles`` | List of oracles taking part in the majority vote |
+-------------+-------------+--------------------------------------------------+

Outputs
^^^^^^^

+-----------+--------------------+-----------------+
| type      | name               | description     |
+===========+====================+=================+
| *address* | ``majorityOracle`` | Oracle contract |
+-----------+--------------------+-----------------+
