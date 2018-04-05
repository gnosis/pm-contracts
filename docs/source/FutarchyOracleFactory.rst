FutarchyOracleFactory
=====================

-  `FutarchyOracleFactory <#futarchyoraclefactory>`__

   -  `Events <#events>`__

      -  `FutarchyOracleCreation <#futarchyoraclecreation-address-indexed-creator-address-futarchyoracle-address-collateraltoken-address-oracle-uint8-outcomecount-int256-lowerbound-int256-upperbound-address-marketmaker-uint24-fee-uint256-tradingperiod-uint256-startdate>`__\ (*address*
         indexed ``creator``, *address* ``futarchyOracle``, *address*
         ``collateralToken``, *address* ``oracle``, *uint8*
         ``outcomeCount``, *int256* ``lowerBound``, *int256*
         ``upperBound``, *address* ``marketMaker``, *uint24* ``fee``,
         *uint256* ``tradingPeriod``, *uint256* ``startDate``)

   -  `Functions <#functions>`__

      -  `createFutarchyOracle <#createfutarchyoracle-address-collateraltoken-address-oracle-uint8-outcomecount-int256-lowerbound-int256-upperbound-address-marketmaker-uint24-fee-uint256-tradingperiod-uint256-startdate>`__\ (*address*
         ``collateralToken``, *address* ``oracle``, *uint8*
         ``outcomeCount``, *int256* ``lowerBound``, *int256*
         ``upperBound``, *address* ``marketMaker``, *uint24* ``fee``,
         *uint256* ``tradingPeriod``, *uint256* ``startDate``)

Futarchy oracle factory contract - Allows to create Futarchy oracle contracts
-----------------------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: FutarchyOracleFactory(\ *address* ``_eventFactory``,
   *address* ``_marketFactory``)
-  This contract does **not** have a fallback function.

Events
------

FutarchyOracleCreation(\ *address* indexed ``creator``, *address* ``futarchyOracle``, *address* ``collateralToken``, *address* ``oracle``, *uint8* ``outcomeCount``, *int256* ``lowerBound``, *int256* ``upperBound``, *address* ``marketMaker``, *uint24* ``fee``, *uint256* ``tradingPeriod``, *uint256* ``startDate``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``31b2f2efb8e38b0139781fb93941176394ceb31c7433234a12da403999ca8766``

Functions
---------

createFutarchyOracle(\ *address* ``collateralToken``, *address* ``oracle``, *uint8* ``outcomeCount``, *int256* ``lowerBound``, *int256* ``upperBound``, *address* ``marketMaker``, *uint24* ``fee``, *uint256* ``tradingPeriod``, *uint256* ``startDate``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``bb6de2bc``

Creates a new Futarchy oracle contract

Inputs
^^^^^^

+------+-------------+------------------------------------------------+
| type | name        | description                                    |
+======+=============+================================================+
| *add | ``collatera | Tokens used as collateral in exchange for      |
| ress | lToken``    | outcome tokens                                 |
| *    |             |                                                |
+------+-------------+------------------------------------------------+
| *add | ``oracle``  | Oracle contract used to resolve the event      |
| ress |             |                                                |
| *    |             |                                                |
+------+-------------+------------------------------------------------+
| *uin | ``outcomeCo | Number of event outcomes                       |
| t8*  | unt``       |                                                |
+------+-------------+------------------------------------------------+
| *int | ``lowerBoun | Lower bound for event outcome                  |
| 256* | d``         |                                                |
+------+-------------+------------------------------------------------+
| *int | ``upperBoun | Lower bound for event outcome                  |
| 256* | d``         |                                                |
+------+-------------+------------------------------------------------+
| *add | ``marketMak | Market maker contract                          |
| ress | er``        |                                                |
| *    |             |                                                |
+------+-------------+------------------------------------------------+
| *uin | ``fee``     | Market fee                                     |
| t24* |             |                                                |
+------+-------------+------------------------------------------------+
| *uin | ``tradingPe | Trading period before decision can be          |
| t256 | riod``      | determined                                     |
| *    |             |                                                |
+------+-------------+------------------------------------------------+
| *uin | ``startDate | Start date for price logging                   |
| t256 | ``          |                                                |
| *    |             |                                                |
+------+-------------+------------------------------------------------+

Outputs
^^^^^^^

+-----------+--------------------+-----------------+
| type      | name               | description     |
+===========+====================+=================+
| *address* | ``futarchyOracle`` | Oracle contract |
+-----------+--------------------+-----------------+
