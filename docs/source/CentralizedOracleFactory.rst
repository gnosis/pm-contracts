CentralizedOracleFactory
========================

-  `CentralizedOracleFactory <#centralizedoraclefactory>`__

   -  `Events <#events>`__

      -  `CentralizedOracleCreation <#centralizedoraclecreation-address-indexed-creator-address-centralizedoracle-bytes-ipfshash>`__\ (*address*
         indexed ``creator``, *address* ``centralizedOracle``, *bytes*
         ``ipfsHash``)

   -  `Functions <#functions>`__

      -  `createCentralizedOracle <#createcentralizedoracle-bytes-ipfshash>`__\ (*bytes*
         ``ipfsHash``)

Centralized oracle factory contract - Allows to create centralized oracle contracts
-----------------------------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: CentralizedOracleFactory()
-  This contract does **not** have a fallback function.

Events
------

CentralizedOracleCreation(\ *address* indexed ``creator``, *address* ``centralizedOracle``, *bytes* ``ipfsHash``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``33a1926cf5c2f7306ac1685bf19260d678fea874f5f59c00b69fa5e2643ecfd2``

Functions
---------

createCentralizedOracle(\ *bytes* ``ipfsHash``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``4e2f220c``

Creates a new centralized oracle contract

Inputs
^^^^^^

+---------+--------------+----------------------------------------------+
| type    | name         | description                                  |
+=========+==============+==============================================+
| *bytes* | ``ipfsHash`` | Hash identifying off chain event description |
+---------+--------------+----------------------------------------------+

Outputs
^^^^^^^

+-----------+-----------------------+-----------------+
| type      | name                  | description     |
+===========+=======================+=================+
| *address* | ``centralizedOracle`` | Oracle contract |
+-----------+-----------------------+-----------------+
