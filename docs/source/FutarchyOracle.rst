FutarchyOracle
==============

-  `FutarchyOracle <#futarchyoracle>`__

   -  `Accessors <#accessors>`__
   -  `Events <#events>`__

      -  `FutarchyFunding <#futarchyfunding-uint256-funding>`__\ (*uint256*
         ``funding``)
      -  `FutarchyClosing <#futarchyclosing>`__\ ()
      -  `OutcomeAssignment <#outcomeassignment-uint256-winningmarketindex>`__\ (*uint256*
         ``winningMarketIndex``)

   -  `Functions <#functions>`__

      -  `setOutcome <#setoutcome>`__\ ()
      -  `close <#close>`__\ ()
      -  `getOutcome <#getoutcome>`__\ ()
      -  `fund <#fund-uint256-funding>`__\ (*uint256* ``funding``)
      -  `isOutcomeSet <#isoutcomeset>`__\ ()

Futarchy oracle contract - Allows to create an oracle based on market behaviour
-------------------------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: FutarchyOracle(\ *address* ``_creator``, *address*
   ``eventFactory``, *address* ``collateralToken``, *address*
   ``oracle``, *uint8* ``outcomeCount``, *int256* ``lowerBound``,
   *int256* ``upperBound``, *address* ``marketFactory``, *address*
   ``marketMaker``, *uint24* ``fee``, *uint256* ``_tradingPeriod``,
   *uint256* ``startDate``)
-  This contract does **not** have a fallback function.

Accessors
---------

-  *uint8* LONG() ``561cce0a``
-  *uint256* winningMarketIndex() ``56cfb75f``
-  *address* markets(\ *uint256*) ``b1283e77``
-  *address* categoricalEvent() ``c3730d03``
-  *bool* isSet() ``c65fb380``
-  *uint256* tradingPeriod() ``f86e3153``

Events
------

FutarchyFunding(\ *uint256* ``funding``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``8b8d4001f25800969052b4c8925891e8acbe35d672701edb74e52265fed9786e``

FutarchyClosing()
~~~~~~~~~~~~~~~~~

**Signature hash**:
``5f5592c20f009bc231fd8491ce6ff3d11f2067fd2bd08c2a9999391a09b67dd4``

OutcomeAssignment(\ *uint256* ``winningMarketIndex``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``39972cb21edd888c2061a2b4b37874524bbc055cfeaa3054682ba5369f5029aa``

Functions
---------

setOutcome()
~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``0537665d``

Allows to set the oracle outcome based on the market with largest long
position

close()
~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``43d726d6``

Closes market for winning outcome and redeems winnings and sends all
collateral tokens to creator

getOutcome()
~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``7e7e4b47``

Returns winning outcome

Outputs
^^^^^^^

+----------+-------------+
| type     | description |
+==========+=============+
| *int256* | Outcome     |
+----------+-------------+

fund(\ *uint256* ``funding``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``ca1d209d``

Funds all markets with equal amount of funding

Inputs
^^^^^^

+-----------+-------------+-------------------+
| type      | name        | description       |
+===========+=============+===================+
| *uint256* | ``funding`` | Amount of funding |
+-----------+-------------+-------------------+

isOutcomeSet()
~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``ccdf68f3``

Returns if winning outcome is set

.. _outputs-1:

Outputs
^^^^^^^

+--------+-----------------+
| type   | description     |
+========+=================+
| *bool* | Is outcome set? |
+--------+-----------------+
