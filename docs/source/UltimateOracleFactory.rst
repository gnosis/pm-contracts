-  `UltimateOracleFactory <#ultimateoraclefactory>`__

   -  `Events <#ultimateoraclefactory-events>`__

      -  `UltimateOracleCreation(\ *address* indexed ``creator``,
         *address* ``ultimateOracle``, *address* ``oracle``, *address*
         ``collateralToken``, *uint8* ``spreadMultiplier``, *uint256*
         ``challengePeriod``, *uint256* ``challengeAmount``, *uint256*
         ``frontRunnerPeriod``) <#ultimateoraclecreationaddress-indexed-creator-address-ultimateoracle-address-oracle-address-collateraltoken-uint8-spreadmultiplier-uint256-challengeperiod-uint256-challengeamount-uint256-frontrunnerperiod>`__

   -  `Functions <#ultimateoraclefactory-functions>`__

      -  `createUltimateOracle(\ *address* ``oracle``, *address*
         ``collateralToken``, *uint8* ``spreadMultiplier``, *uint256*
         ``challengePeriod``, *uint256* ``challengeAmount``, *uint256*
         ``frontRunnerPeriod``) <#createultimateoracleaddress-oracle-address-collateraltoken-uint8-spreadmultiplier-uint256-challengeperiod-uint256-challengeamount-uint256-frontrunnerperiod>`__

UltimateOracleFactory
=====================

Ultimate oracle factory contract - Allows to create ultimate oracle contracts
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: UltimateOracleFactory()
-  This contract does **not** have a fallback function.

UltimateOracleFactory Events
----------------------------

UltimateOracleCreation(\ *address* indexed ``creator``, *address* ``ultimateOracle``, *address* ``oracle``, *address* ``collateralToken``, *uint8* ``spreadMultiplier``, *uint256* ``challengePeriod``, *uint256* ``challengeAmount``, *uint256* ``frontRunnerPeriod``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``e6ae2b8211e9721c5dae1d93f70be0ba07bd111608ba4db4317742e1a87fff40``

UltimateOracleFactory Functions
-------------------------------

createUltimateOracle(\ *address* ``oracle``, *address* ``collateralToken``, *uint8* ``spreadMultiplier``, *uint256* ``challengePeriod``, *uint256* ``challengeAmount``, *uint256* ``frontRunnerPeriod``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``ce70faec``

Creates a new ultimate Oracle contract

Inputs
^^^^^^

+-----+-------------+-------------------------------------------------+
| typ | name        | description                                     |
| e   |             |                                                 |
+=====+=============+=================================================+
| *ad | ``oracle``  | Oracle address                                  |
| dre |             |                                                 |
| ss* |             |                                                 |
+-----+-------------+-------------------------------------------------+
| *ad | ``collatera | Collateral token address                        |
| dre | lToken``    |                                                 |
| ss* |             |                                                 |
+-----+-------------+-------------------------------------------------+
| *ui | ``spreadMul | Defines the spread as a multiple of the money   |
| nt8 | tiplier``   | bet on other outcomes                           |
| *   |             |                                                 |
+-----+-------------+-------------------------------------------------+
| *ui | ``challenge | Time to challenge oracle outcome                |
| nt2 | Period``    |                                                 |
| 56* |             |                                                 |
+-----+-------------+-------------------------------------------------+
| *ui | ``challenge | Amount to challenge the outcome                 |
| nt2 | Amount``    |                                                 |
| 56* |             |                                                 |
+-----+-------------+-------------------------------------------------+
| *ui | ``frontRunn | Time to overbid the front-runner                |
| nt2 | erPeriod``  |                                                 |
| 56* |             |                                                 |
+-----+-------------+-------------------------------------------------+

Outputs
^^^^^^^

+-----------+--------------------+-----------------+
| type      | name               | description     |
+===========+====================+=================+
| *address* | ``ultimateOracle`` | Oracle contract |
+-----------+--------------------+-----------------+
