EtherToken
==========

-  `EtherToken <#ethertoken>`__

   -  `Accessors <#accessors>`__
   -  `Events <#events>`__

      -  `Deposit <#deposit-address-indexed-sender-uint256-value>`__\ (*address*
         indexed ``sender``, *uint256* ``value``)
      -  `Withdrawal <#withdrawal-address-indexed-receiver-uint256-value>`__\ (*address*
         indexed ``receiver``, *uint256* ``value``)
      -  `Transfer <#transfer-address-indexed-from-address-indexed-to-uint256-value>`__\ (*address*
         indexed ``from``, *address* indexed ``to``, *uint256*
         ``value``)
      -  `Approval <#approval-address-indexed-owner-address-indexed-spender-uint256-value>`__\ (*address*
         indexed ``owner``, *address* indexed ``spender``, *uint256*
         ``value``)

   -  `Functions <#functions>`__

      -  `approve <#approve-address-spender-uint256-value>`__\ (*address*
         ``spender``, *uint256* ``value``)
      -  `totalSupply <#totalsupply>`__\ ()
      -  `transferFrom <#transferfrom-address-from-address-to-uint256-value>`__\ (*address*
         ``from``, *address* ``to``, *uint256* ``value``)
      -  `withdraw <#withdraw-uint256-value>`__\ (*uint256* ``value``)
      -  `balanceOf <#balanceof-address-owner>`__\ (*address* ``owner``)
      -  `transfer <#transfer-address-to-uint256-value>`__\ (*address*
         ``to``, *uint256* ``value``)
      -  `deposit <#deposit>`__\ ()
      -  `allowance <#allowance-address-owner-address-spender>`__\ (*address*
         ``owner``, *address* ``spender``)

Token contract - Token exchanging Ether 1:1
-------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: EtherToken()
-  This contract does **not** have a fallback function.

Accessors
---------

-  *string* name() ``06fdde03``
-  *uint8* decimals() ``313ce567``
-  *string* symbol() ``95d89b41``

Events
------

Deposit(\ *address* indexed ``sender``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``e1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c``

Withdrawal(\ *address* indexed ``receiver``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65``

Transfer(\ *address* indexed ``from``, *address* indexed ``to``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef``

Approval(\ *address* indexed ``owner``, *address* indexed ``spender``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925``

Functions
---------

approve(\ *address* ``spender``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``095ea7b3``

Sets approved amount of tokens for spender. Returns success

Inputs
^^^^^^

+-----------+-------------+----------------------------+
| type      | name        | description                |
+===========+=============+============================+
| *address* | ``spender`` | Address of allowed account |
+-----------+-------------+----------------------------+
| *uint256* | ``value``   | Number of approved tokens  |
+-----------+-------------+----------------------------+

Outputs
^^^^^^^

+--------+--------------------------+
| type   | description              |
+========+==========================+
| *bool* | Was approval successful? |
+--------+--------------------------+

totalSupply()
~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``18160ddd``

Returns total supply of tokens

.. _outputs-1:

Outputs
^^^^^^^

+-----------+--------------+
| type      | description  |
+===========+==============+
| *uint256* | Total supply |
+-----------+--------------+

transferFrom(\ *address* ``from``, *address* ``to``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``23b872dd``

Allows allowed third party to transfer tokens from one address to
another. Returns success

.. _inputs-1:

Inputs
^^^^^^

+-----------+-----------+-----------------------------------------+
| type      | name      | description                             |
+===========+===========+=========================================+
| *address* | ``from``  | Address from where tokens are withdrawn |
+-----------+-----------+-----------------------------------------+
| *address* | ``to``    | Address to where tokens are sent        |
+-----------+-----------+-----------------------------------------+
| *uint256* | ``value`` | Number of tokens to transfer            |
+-----------+-----------+-----------------------------------------+

.. _outputs-2:

Outputs
^^^^^^^

+--------+--------------------------+
| type   | description              |
+========+==========================+
| *bool* | Was transfer successful? |
+--------+--------------------------+

withdraw(\ *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``2e1a7d4d``

Sells tokens in exchange for Ether, exchanging them 1:1

.. _inputs-2:

Inputs
^^^^^^

+-----------+-----------+--------------------------+
| type      | name      | description              |
+===========+===========+==========================+
| *uint256* | ``value`` | Number of tokens to sell |
+-----------+-----------+--------------------------+

balanceOf(\ *address* ``owner``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``70a08231``

Returns number of tokens owned by given address

.. _inputs-3:

Inputs
^^^^^^

+-----------+-----------+------------------------+
| type      | name      | description            |
+===========+===========+========================+
| *address* | ``owner`` | Address of token owner |
+-----------+-----------+------------------------+

.. _outputs-3:

Outputs
^^^^^^^

+-----------+------------------+
| type      | description      |
+===========+==================+
| *uint256* | Balance of owner |
+-----------+------------------+

transfer(\ *address* ``to``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``a9059cbb``

Transfers sender’s tokens to a given address. Returns success

.. _inputs-4:

Inputs
^^^^^^

+-----------+-----------+------------------------------+
| type      | name      | description                  |
+===========+===========+==============================+
| *address* | ``to``    | Address of token receiver    |
+-----------+-----------+------------------------------+
| *uint256* | ``value`` | Number of tokens to transfer |
+-----------+-----------+------------------------------+

.. _outputs-4:

Outputs
^^^^^^^

+--------+--------------------------+
| type   | description              |
+========+==========================+
| *bool* | Was transfer successful? |
+--------+--------------------------+

deposit()
~~~~~~~~~

-  **State mutability**: ``payable``
-  **Signature hash**: ``d0e30db0``

Buys tokens with Ether, exchanging them 1:1

allowance(\ *address* ``owner``, *address* ``spender``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``dd62ed3e``

Returns number of allowed tokens for given address

.. _inputs-5:

Inputs
^^^^^^

+-----------+-------------+--------------------------+
| type      | name        | description              |
+===========+=============+==========================+
| *address* | ``owner``   | Address of token owner   |
+-----------+-------------+--------------------------+
| *address* | ``spender`` | Address of token spender |
+-----------+-------------+--------------------------+

.. _outputs-5:

Outputs
^^^^^^^

+-----------+---------------------------------+
| type      | description                     |
+===========+=================================+
| *uint256* | Remaining allowance for spender |
+-----------+---------------------------------+
