MarketMaker
===========

-  `MarketMaker <#marketmaker>`__

   -  `Functions <#functions>`__

      -  `calcProfit <#calcprofit-address-market-uint8-outcometokenindex-uint256-outcometokencount>`__\ (*address*
         ``market``, *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``)
      -  `calcCost <#calccost-address-market-uint8-outcometokenindex-uint256-outcometokencount>`__\ (*address*
         ``market``, *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``)
      -  `calcMarginalPrice <#calcmarginalprice-address-market-uint8-outcometokenindex>`__\ (*address*
         ``market``, *uint8* ``outcomeTokenIndex``)

Abstract market maker contract - Functions to be implemented by market maker contracts
--------------------------------------------------------------------------------------

-  **Constructor**: MarketMaker()
-  This contract does **not** have a fallback function.

Functions
---------

calcProfit(\ *address* ``market``, *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``4091c6a9``

Inputs
^^^^^^

+-----------+-----------------------+
| type      | name                  |
+===========+=======================+
| *address* | ``market``            |
+-----------+-----------------------+
| *uint8*   | ``outcomeTokenIndex`` |
+-----------+-----------------------+
| *uint256* | ``outcomeTokenCount`` |
+-----------+-----------------------+

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+

calcCost(\ *address* ``market``, *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``bd8ff817``

.. _inputs-1:

Inputs
^^^^^^

+-----------+-----------------------+
| type      | name                  |
+===========+=======================+
| *address* | ``market``            |
+-----------+-----------------------+
| *uint8*   | ``outcomeTokenIndex`` |
+-----------+-----------------------+
| *uint256* | ``outcomeTokenCount`` |
+-----------+-----------------------+

.. _outputs-1:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+

calcMarginalPrice(\ *address* ``market``, *uint8* ``outcomeTokenIndex``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``d812d346``

.. _inputs-2:

Inputs
^^^^^^

+-----------+-----------------------+
| type      | name                  |
+===========+=======================+
| *address* | ``market``            |
+-----------+-----------------------+
| *uint8*   | ``outcomeTokenIndex`` |
+-----------+-----------------------+

.. _outputs-2:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+
