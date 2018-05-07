-  `Campaign <#campaign>`__

   -  `Accessors <#campaign-accessors>`__
   -  `Events <#campaign-events>`__

      -  `CampaignFunding(\ *address* indexed ``sender``, *uint256*
         ``funding``) <#campaignfundingaddress-indexed-sender-uint256-funding>`__
      -  `CampaignRefund(\ *address* indexed ``sender``, *uint256*
         ``refund``) <#campaignrefundaddress-indexed-sender-uint256-refund>`__
      -  `MarketCreation(\ *address* indexed
         ``market``) <#marketcreationaddress-indexed-market>`__
      -  `MarketClosing() <#marketclosing>`__
      -  `FeeWithdrawal(\ *address* indexed ``receiver``, *uint256*
         ``fees``) <#feewithdrawaladdress-indexed-receiver-uint256-fees>`__

   -  `Functions <#campaign-functions>`__

      -  `withdrawFees() <#withdrawfees>`__
      -  `refund() <#refund>`__
      -  `createMarket() <#createmarket>`__
      -  `closeMarket() <#closemarket>`__
      -  `fund(\ *uint256* ``amount``) <#funduint256-amount>`__

Campaign
========

Campaign contract - Allows to crowdfund a market
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: Campaign(\ *address* ``_eventContract``, *address*
   ``_marketFactory``, *address* ``_marketMaker``, *uint24* ``_fee``,
   *uint256* ``_funding``, *uint256* ``_deadline``)
-  This contract does **not** have a fallback function.

Campaign Accessors
------------------

-  *address* marketFactory() ``06ae7095``
-  *address* marketMaker() ``1f21f9af``
-  *uint256* finalBalance() ``2129e25a``
-  *uint256* deadline() ``29dcb0cf``
-  *uint256* contributions(\ *address*) ``42e94c90``
-  *address* market() ``80f55605``
-  *uint8* stage() ``c040e6b8``
-  *uint256* funding() ``cb4c86b7``
-  *uint24* fee() ``ddca3f43``
-  *address* eventContract() ``e274fd24``
-  *uint24* FEE_RANGE() ``fbde47f6``

Campaign Events
---------------

CampaignFunding(\ *address* indexed ``sender``, *uint256* ``funding``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``9e85601c404591b54325b6512021f8145643571c59865b7ab29ed9e0664cb17f``

CampaignRefund(\ *address* indexed ``sender``, *uint256* ``refund``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``d53235e384e83b261994d71b101de6c22402415c0c0d313f064a90e91039e2a9``

MarketCreation(\ *address* indexed ``market``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``d50a500cb3b7c976a045df06de01ca42c942e1a2c43ac27d96bfa7ece3138a99``

MarketClosing()
~~~~~~~~~~~~~~~

**Signature hash**:
``e7d85885f81486e8f4c99e50e056745493861b8b5d4f973dcf0c3c0f74a25e07``

FeeWithdrawal(\ *address* indexed ``receiver``, *uint256* ``fees``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``ee33a3a9cb48e4ff209f8b1c67c4632f1dbbf55aeff8e6f17d957ade7a6fb17c``

Campaign Functions
------------------

withdrawFees()
~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``476343ee``

Allows to withdraw fees from campaign contract to contributor

Outputs
^^^^^^^

+-----------+----------+-------------+
| type      | name     | description |
+===========+==========+=============+
| *uint256* | ``fees`` | Fee amount  |
+-----------+----------+-------------+

refund()
~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``590e1ae3``

Withdraws refund amount

.. _outputs-1:

Outputs
^^^^^^^

+-----------+------------------+---------------+
| type      | name             | description   |
+===========+==================+===============+
| *uint256* | ``refundAmount`` | Refund amount |
+-----------+------------------+---------------+

createMarket()
~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``aea0e35f``

Allows to create market after successful funding

.. _outputs-2:

Outputs
^^^^^^^

+-----------+----------------+
| type      | description    |
+===========+================+
| *address* | Market address |
+-----------+----------------+

closeMarket()
~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``c511ed5e``

Allows to withdraw fees from market contract to campaign contract

fund(\ *uint256* ``amount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``ca1d209d``

Allows to contribute to required market funding

Inputs
^^^^^^

+-----------+------------+-----------------------------+
| type      | name       | description                 |
+===========+============+=============================+
| *uint256* | ``amount`` | Amount of collateral tokens |
+-----------+------------+-----------------------------+
