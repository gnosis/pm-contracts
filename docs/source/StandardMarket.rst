-  `StandardMarket <#standardmarket>`__

   -  `Accessors <#standardmarket-accessors>`__
   -  `Events <#standardmarket-events>`__

      -  `MarketFunding(\ *uint256*
         ``funding``) <#marketfundinguint256-funding>`__
      -  `MarketClosing() <#marketclosing>`__
      -  `FeeWithdrawal(\ *uint256*
         ``fees``) <#feewithdrawaluint256-fees>`__
      -  `OutcomeTokenPurchase(\ *address* indexed ``buyer``, *uint8*
         ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``,
         *uint256* ``outcomeTokenCost``, *uint256*
         ``marketFees``) <#outcometokenpurchaseaddress-indexed-buyer-uint8-outcometokenindex-uint256-outcometokencount-uint256-outcometokencost-uint256-marketfees>`__
      -  `OutcomeTokenSale(\ *address* indexed ``seller``, *uint8*
         ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``,
         *uint256* ``outcomeTokenProfit``, *uint256*
         ``marketFees``) <#outcometokensaleaddress-indexed-seller-uint8-outcometokenindex-uint256-outcometokencount-uint256-outcometokenprofit-uint256-marketfees>`__
      -  `OutcomeTokenShortSale(\ *address* indexed ``buyer``, *uint8*
         ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``,
         *uint256*
         ``cost``) <#outcometokenshortsaleaddress-indexed-buyer-uint8-outcometokenindex-uint256-outcometokencount-uint256-cost>`__

   -  `Functions <#standardmarket-functions>`__

      -  `shortSell(\ *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``, *uint256*
         ``minProfit``) <#shortselluint8-outcometokenindex-uint256-outcometokencount-uint256-minprofit>`__
      -  `close() <#close>`__
      -  `sell(\ *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``, *uint256*
         ``minProfit``) <#selluint8-outcometokenindex-uint256-outcometokencount-uint256-minprofit>`__
      -  `withdrawFees() <#withdrawfees>`__
      -  `calcMarketFee(\ *uint256*
         ``outcomeTokenCost``) <#calcmarketfeeuint256-outcometokencost>`__
      -  `fund(\ *uint256* ``_funding``) <#funduint256-_funding>`__
      -  `buy(\ *uint8* ``outcomeTokenIndex``, *uint256*
         ``outcomeTokenCount``, *uint256*
         ``maxCost``) <#buyuint8-outcometokenindex-uint256-outcometokencount-uint256-maxcost>`__

StandardMarket
==============

Market factory contract - Allows to create market contracts
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: StandardMarket(\ *address* ``_creator``, *address*
   ``_eventContract``, *address* ``_marketMaker``, *uint24* ``_fee``)
-  This contract does **not** have a fallback function.

StandardMarket Accessors
------------------------

-  *address* creator() ``02d05d3f``
-  *address* marketMaker() ``1f21f9af``
-  *uint256* createdAtBlock() ``59acb42c``
-  *int256* netOutcomeTokensSold(\ *uint256*) ``a157979c``
-  *uint8* stage() ``c040e6b8``
-  *uint256* funding() ``cb4c86b7``
-  *uint24* fee() ``ddca3f43``
-  *address* eventContract() ``e274fd24``
-  *uint24* FEE_RANGE() ``fbde47f6``

StandardMarket Events
---------------------

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

StandardMarket Functions
------------------------

shortSell(\ *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``minProfit``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``28c05d32``

Buys all outcomes, then sells all shares of selected outcome which were
bought, keeping shares of all other outcome tokens.

Inputs
^^^^^^

+-----+------------+---------------------------------------------------+
| typ | name       | description                                       |
| e   |            |                                                   |
+=====+============+===================================================+
| *ui | ``outcomeT | Index of the outcome token to short sell          |
| nt8 | okenIndex` |                                                   |
| *   | `          |                                                   |
+-----+------------+---------------------------------------------------+
| *ui | ``outcomeT | Amount of outcome tokens to short sell            |
| nt2 | okenCount` |                                                   |
| 56* | `          |                                                   |
+-----+------------+---------------------------------------------------+
| *ui | ``minProfi | The minimum profit in collateral tokens to earn   |
| nt2 | t``        | for short sold outcome tokens                     |
| 56* |            |                                                   |
+-----+------------+---------------------------------------------------+

Outputs
^^^^^^^

+-----------+----------+-------------------------------------------------+
| type      | name     | description                                     |
+===========+==========+=================================================+
| *uint256* | ``cost`` | Cost to short sell outcome in collateral tokens |
+-----------+----------+-------------------------------------------------+

close()
~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``43d726d6``

Allows market creator to close the markets by transferring all remaining
outcome tokens to the creator

sell(\ *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``minProfit``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``46280a80``

Allows to sell outcome tokens to market maker

.. _inputs-1:

Inputs
^^^^^^

+-----+-------------+-------------------------------------------------+
| typ | name        | description                                     |
| e   |             |                                                 |
+=====+=============+=================================================+
| *ui | ``outcomeTo | Index of the outcome token to sell              |
| nt8 | kenIndex``  |                                                 |
| *   |             |                                                 |
+-----+-------------+-------------------------------------------------+
| *ui | ``outcomeTo | Amount of outcome tokens to sell                |
| nt2 | kenCount``  |                                                 |
| 56* |             |                                                 |
+-----+-------------+-------------------------------------------------+
| *ui | ``minProfit | The minimum profit in collateral tokens to earn |
| nt2 | ``          | for outcome tokens                              |
| 56* |             |                                                 |
+-----+-------------+-------------------------------------------------+

.. _outputs-1:

Outputs
^^^^^^^

+-----------+------------+-----------------------------+
| type      | name       | description                 |
+===========+============+=============================+
| *uint256* | ``profit`` | Profit in collateral tokens |
+-----------+------------+-----------------------------+

withdrawFees()
~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``476343ee``

Allows market creator to withdraw fees generated by trades

.. _outputs-2:

Outputs
^^^^^^^

+-----------+----------+-------------+
| type      | name     | description |
+===========+==========+=============+
| *uint256* | ``fees`` | Fee amount  |
+-----------+----------+-------------+

calcMarketFee(\ *uint256* ``outcomeTokenCost``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``b0011509``

Calculates fee to be paid to market maker

.. _inputs-2:

Inputs
^^^^^^

+-----------+----------------------+--------------------------------+
| type      | name                 | description                    |
+===========+======================+================================+
| *uint256* | ``outcomeTokenCost`` | Cost for buying outcome tokens |
+-----------+----------------------+--------------------------------+

.. _outputs-3:

Outputs
^^^^^^^

+-----------+---------------+
| type      | description   |
+===========+===============+
| *uint256* | Fee for trade |
+-----------+---------------+

fund(\ *uint256* ``_funding``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``ca1d209d``

Allows to fund the market with collateral tokens converting them into
outcome tokens

.. _inputs-3:

Inputs
^^^^^^

+-----------+--------------+----------------+
| type      | name         | description    |
+===========+==============+================+
| *uint256* | ``_funding`` | Funding amount |
+-----------+--------------+----------------+

buy(\ *uint8* ``outcomeTokenIndex``, *uint256* ``outcomeTokenCount``, *uint256* ``maxCost``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``f6d956df``

Allows to buy outcome tokens from market maker

.. _inputs-4:

Inputs
^^^^^^

+------+--------------+------------------------------------------------+
| type | name         | description                                    |
+======+==============+================================================+
| *uin | ``outcomeTok | Index of the outcome token to buy              |
| t8*  | enIndex``    |                                                |
+------+--------------+------------------------------------------------+
| *uin | ``outcomeTok | Amount of outcome tokens to buy                |
| t256 | enCount``    |                                                |
| *    |              |                                                |
+------+--------------+------------------------------------------------+
| *uin | ``maxCost``  | The maximum cost in collateral tokens to pay   |
| t256 |              | for outcome tokens                             |
| *    |              |                                                |
+------+--------------+------------------------------------------------+

.. _outputs-4:

Outputs
^^^^^^^

+-----------+----------+---------------------------+
| type      | name     | description               |
+===========+==========+===========================+
| *uint256* | ``cost`` | Cost in collateral tokens |
+-----------+----------+---------------------------+
