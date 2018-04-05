StandardMarketWithPriceLoggerFactory
====================================

-  `StandardMarketWithPriceLoggerFactory <#standardmarketwithpriceloggerfactory>`__

   -  `Events <#events>`__

      -  `StandardMarketWithPriceLoggerCreation <#standardmarketwithpriceloggercreation-address-indexed-creator-address-market-address-eventcontract-address-marketmaker-uint24-fee-uint256-startdate>`__\ (*address*
         indexed ``creator``, *address* ``market``, *address*
         ``eventContract``, *address* ``marketMaker``, *uint24* ``fee``,
         *uint256* ``startDate``)

   -  `Functions <#functions>`__

      -  `createMarket <#createmarket-address-eventcontract-address-marketmaker-uint24-fee-uint256-startdate>`__\ (*address*
         ``eventContract``, *address* ``marketMaker``, *uint24* ``fee``,
         *uint256* ``startDate``)

Market factory contract - Allows to create market contracts
-----------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: StandardMarketWithPriceLoggerFactory()
-  This contract does **not** have a fallback function.

Events
------

StandardMarketWithPriceLoggerCreation(\ *address* indexed ``creator``, *address* ``market``, *address* ``eventContract``, *address* ``marketMaker``, *uint24* ``fee``, *uint256* ``startDate``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``969b1ad77db8ae8298dedcdf1f2945322eaf681e1d56fcebfd4c23de996dc484``

Functions
---------

createMarket(\ *address* ``eventContract``, *address* ``marketMaker``, *uint24* ``fee``, *uint256* ``startDate``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``8e44df53``

Creates a new market contract

Inputs
^^^^^^

+-----------+-------------------+------------------------------+
| type      | name              | description                  |
+===========+===================+==============================+
| *address* | ``eventContract`` | Event contract               |
+-----------+-------------------+------------------------------+
| *address* | ``marketMaker``   | Market maker contract        |
+-----------+-------------------+------------------------------+
| *uint24*  | ``fee``           | Market fee                   |
+-----------+-------------------+------------------------------+
| *uint256* | ``startDate``     | Start date for price logging |
+-----------+-------------------+------------------------------+

Outputs
^^^^^^^

+-----------+------------+-----------------+
| type      | name       | description     |
+===========+============+=================+
| *address* | ``market`` | Market contract |
+-----------+------------+-----------------+
