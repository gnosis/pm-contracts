Market
======

-  `Market <#market>`__

   -  `Accessors <#accessors>`__
   -  `Events <#events>`__

      -  `MarketFunding <#marketfunding-uint256-funding>`__\ (*uint256*
         ``funding``)
      -  `MarketClosing <#marketclosing>`__\ ()
      -  `FeeWithdrawal <#feewithdrawal-uint256-fees>`__\ (*uint256*
         ``fees``)
      -  `OutcomeTokenPurchase <#outcometokenpurchase-address-indexed-buyer-uint8-outcometokenindex-uint256-outcometokencount-uint256-outcometokencost-uint256-marketfees>`__\ (*address*
         indexed ``buyer``, *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``, *uint256* ``outcomeTokenCost``,
         *uint256* ``marketFees``)
      -  `OutcomeTokenSale <#outcometokensale-address-indexed-seller-uint8-outcometokenindex-uint256-outcometokencount-uint256-outcometokenprofit-uint256-marketfees>`__\ (*address*
         indexed ``seller``, *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``, *uint256* ``outcomeTokenProfit``,
         *uint256* ``marketFees``)
      -  `OutcomeTokenShortSale <#outcometokenshortsale-address-indexed-buyer-uint8-outcometokenindex-uint256-outcometokencount-uint256-cost>`__\ (*address*
         indexed ``buyer``, *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``, *uint256* ``cost``)

   -  `Functions <#functions>`__

      -  `shortSell <#shortsell-uint8-outcometokenindex-uint256-outcometokencount-uint256-minprofit>`__\ (*uint8*
         ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``,
         *uint256* ``minProfit``)
      -  `close <#close>`__\ ()
      -  `sell <#sell-uint8-outcometokenindex-uint256-outcometokencount-uint256-minprofit>`__\ (*uint8*
         ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``,
         *uint256* ``minProfit``)
      -  `withdrawFees <#withdrawfees>`__\ ()
      -  `calcMarketFee <#calcmarketfee-uint256-outcometokencost>`__\ (*uint256*
         ``outcomeTokenCost``)
      -  `fund <#fund-uint256-_funding>`__\ (*uint256* ``_funding``)
      -  `buy <#buy-uint8-outcometokenindex-uint256-outcometokencount-uint256-maxcost>`__\ (*uint8*
         ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``,
         *uint256* ``maxCost``)

Abstract market contract - Functions to be implemented by market contracts
--------------------------------------------------------------------------

-  **Constructor**: Market()
-  This contract does **not** have a fallback function.

Accessors
---------

-  *address* creator() ``02d05d3f``
-  *address* marketMaker() ``1f21f9af``
-  *uint256* createdAtBlock() ``59acb42c``
-  *int256* netOutcomeTokensSold(\ *uint256*) ``a157979c``
-  *uint8* stage() ``c040e6b8``
-  *uint256* funding() ``cb4c86b7``
-  *uint24* fee() ``ddca3f43``
-  *address* eventContract() ``e274fd24``

Events
------

MarketFunding(\ *uint256* ``funding``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``8a2fe22ce705a4ac9c189969cef327affbdc477afdae4ae274c2f8ad021f9163``

MarketClosing()
~~~~~~~~~~~~~~~

**Signature hash**:
``e7d85885f81486e8f4c99e50e056745493861b8b5d4f973dcf0c3c0f74a25e07``

FeeWithdrawal(\ *uint256* ``fees``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``706d7f48c702007c2fb0881cea5759732e64f52faee427d5ab030787cfb7d787``

OutcomeTokenPurchase(\ *address* indexed ``buyer``, *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``outcomeTokenCost``, *uint256* ``marketFees``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``7caea4a19892ce49b4daa2014d5599eed561dcd16ffabfac851a9737217ae410``

OutcomeTokenSale(\ *address* indexed ``seller``, *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``outcomeTokenProfit``, *uint256* ``marketFees``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``ab24ef3371efb2e0e3b02955e33b8ef03c14523e71f3bda87878a2386cc17b69``

OutcomeTokenShortSale(\ *address* indexed ``buyer``, *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``cost``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``1dbdc4ff4d51949738d56e120b2be4edecc55d8d2150f1616ec5802abaae3f88``

Functions
---------

shortSell(\ *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``minProfit``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``28c05d32``

Inputs
^^^^^^

+-----------+-----------------------+
| type      | name                  |
+===========+=======================+
| *uint8*   | ``outcomeTokenIndex`` |
+-----------+-----------------------+
| *uint256* | ``outcomeTokenCount`` |
+-----------+-----------------------+
| *uint256* | ``minProfit``         |
+-----------+-----------------------+

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+

close()
~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``43d726d6``

sell(\ *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``minProfit``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``46280a80``

.. _inputs-1:

Inputs
^^^^^^

+-----------+-----------------------+
| type      | name                  |
+===========+=======================+
| *uint8*   | ``outcomeTokenIndex`` |
+-----------+-----------------------+
| *uint256* | ``outcomeTokenCount`` |
+-----------+-----------------------+
| *uint256* | ``minProfit``         |
+-----------+-----------------------+

.. _outputs-1:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+

withdrawFees()
~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``476343ee``

.. _outputs-2:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+

calcMarketFee(\ *uint256* ``outcomeTokenCost``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``b0011509``

.. _inputs-2:

Inputs
^^^^^^

+-----------+----------------------+
| type      | name                 |
+===========+======================+
| *uint256* | ``outcomeTokenCost`` |
+-----------+----------------------+

.. _outputs-3:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+

fund(\ *uint256* ``_funding``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``ca1d209d``

.. _inputs-3:

Inputs
^^^^^^

+-----------+--------------+
| type      | name         |
+===========+==============+
| *uint256* | ``_funding`` |
+-----------+--------------+

buy(\ *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``maxCost``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``f6d956df``

.. _inputs-4:

Inputs
^^^^^^

+-----------+-----------------------+
| type      | name                  |
+===========+=======================+
| *uint8*   | ``outcomeTokenIndex`` |
+-----------+-----------------------+
| *uint256* | ``outcomeTokenCount`` |
+-----------+-----------------------+
| *uint256* | ``maxCost``           |
+-----------+-----------------------+

.. _outputs-4:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+
