EventFactory
============

-  `EventFactory <#eventfactory>`__

   -  `Accessors <#accessors>`__
   -  `Events <#events>`__

      -  `CategoricalEventCreation <#categoricaleventcreation-address-indexed-creator-address-categoricalevent-address-collateraltoken-address-oracle-uint8-outcomecount>`__\ (*address*
         indexed ``creator``, *address* ``categoricalEvent``, *address*
         ``collateralToken``, *address* ``oracle``, *uint8*
         ``outcomeCount``)
      -  `ScalarEventCreation <#scalareventcreation-address-indexed-creator-address-scalarevent-address-collateraltoken-address-oracle-int256-lowerbound-int256-upperbound>`__\ (*address*
         indexed ``creator``, *address* ``scalarEvent``, *address*
         ``collateralToken``, *address* ``oracle``, *int256*
         ``lowerBound``, *int256* ``upperBound``)

   -  `Functions <#functions>`__

      -  `createScalarEvent <#createscalarevent-address-collateraltoken-address-oracle-int256-lowerbound-int256-upperbound>`__\ (*address*
         ``collateralToken``, *address* ``oracle``, *int256*
         ``lowerBound``, *int256* ``upperBound``)
      -  `createCategoricalEvent <#createcategoricalevent-address-collateraltoken-address-oracle-uint8-outcomecount>`__\ (*address*
         ``collateralToken``, *address* ``oracle``, *uint8*
         ``outcomeCount``)

Event factory contract - Allows creation of categorical and scalar events
-------------------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: EventFactory()
-  This contract does **not** have a fallback function.

Accessors
---------

-  *address* categoricalEvents(\ *bytes32*) ``8d1d2c21``
-  *address* scalarEvents(\ *bytes32*) ``9897e8a5``

Events
------

CategoricalEventCreation(\ *address* indexed ``creator``, *address* ``categoricalEvent``, *address* ``collateralToken``, *address* ``oracle``, *uint8* ``outcomeCount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``9732758aee476f5125b50d29cc43e28422f12ec078ba9f5c712f9dbd52796f59``

ScalarEventCreation(\ *address* indexed ``creator``, *address* ``scalarEvent``, *address* ``collateralToken``, *address* ``oracle``, *int256* ``lowerBound``, *int256* ``upperBound``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``d613e63983a1538814e1b390fc232d0e20462cf7410924f6b6a5f29ea38e82ed``

Functions
---------

createScalarEvent(\ *address* ``collateralToken``, *address* ``oracle``, *int256* ``lowerBound``, *int256* ``upperBound``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``5ea194a3``

Creates a new scalar event and adds it to the event mapping

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
| *int | ``lowerBoun | Lower bound for event outcome                  |
| 256* | d``         |                                                |
+------+-------------+------------------------------------------------+
| *int | ``upperBoun | Lower bound for event outcome                  |
| 256* | d``         |                                                |
+------+-------------+------------------------------------------------+

Outputs
^^^^^^^

+-----------+-------------------+----------------+
| type      | name              | description    |
+===========+===================+================+
| *address* | ``eventContract`` | Event contract |
+-----------+-------------------+----------------+

createCategoricalEvent(\ *address* ``collateralToken``, *address* ``oracle``, *uint8* ``outcomeCount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``9df0c176``

Creates a new categorical event and adds it to the event mapping

.. _inputs-1:

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

.. _outputs-1:

Outputs
^^^^^^^

+-----------+-------------------+----------------+
| type      | name              | description    |
+===========+===================+================+
| *address* | ``eventContract`` | Event contract |
+-----------+-------------------+----------------+
