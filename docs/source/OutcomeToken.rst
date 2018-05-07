-  `OutcomeToken <#outcometoken>`__

   -  `Accessors <#outcometoken-accessors>`__
   -  `Events <#outcometoken-events>`__

      -  `Issuance(\ *address* indexed ``owner``, *uint256*
         ``amount``) <#issuanceaddress-indexed-owner-uint256-amount>`__
      -  `Revocation(\ *address* indexed ``owner``, *uint256*
         ``amount``) <#revocationaddress-indexed-owner-uint256-amount>`__
      -  `Transfer(\ *address* indexed ``from``, *address* indexed
         ``to``, *uint256*
         ``value``) <#transferaddress-indexed-from-address-indexed-to-uint256-value>`__
      -  `Approval(\ *address* indexed ``owner``, *address* indexed
         ``spender``, *uint256*
         ``value``) <#approvaladdress-indexed-owner-address-indexed-spender-uint256-value>`__

   -  `Functions <#outcometoken-functions>`__

      -  `approve(\ *address* ``spender``, *uint256*
         ``value``) <#approveaddress-spender-uint256-value>`__
      -  `totalSupply() <#totalsupply>`__
      -  `transferFrom(\ *address* ``from``, *address* ``to``, *uint256*
         ``value``) <#transferfromaddress-from-address-to-uint256-value>`__
      -  `balanceOf(\ *address* ``owner``) <#balanceofaddress-owner>`__
      -  `issue(\ *address* ``_for``, *uint256*
         ``outcomeTokenCount``) <#issueaddress-_for-uint256-outcometokencount>`__
      -  `transfer(\ *address* ``to``, *uint256*
         ``value``) <#transferaddress-to-uint256-value>`__
      -  `allowance(\ *address* ``owner``, *address*
         ``spender``) <#allowanceaddress-owner-address-spender>`__
      -  `revoke(\ *address* ``_for``, *uint256*
         ``outcomeTokenCount``) <#revokeaddress-_for-uint256-outcometokencount>`__

OutcomeToken
============

Outcome token contract - Issuing and revoking outcome tokens
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: OutcomeToken()
-  This contract does **not** have a fallback function.

OutcomeToken Accessors
----------------------

-  *address* eventContract() ``e274fd24``

OutcomeToken Events
-------------------

Issuance(\ *address* indexed ``owner``, *uint256* ``amount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``9cb9c14f7bc76e3a89b796b091850526236115352a198b1e472f00e91376bbcb``

Revocation(\ *address* indexed ``owner``, *uint256* ``amount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``f6a317157440607f36269043eb55f1287a5a19ba2216afeab88cd46cbcfb88e9``

Transfer(\ *address* indexed ``from``, *address* indexed ``to``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef``

Approval(\ *address* indexed ``owner``, *address* indexed ``spender``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925``

OutcomeToken Functions
----------------------

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

balanceOf(\ *address* ``owner``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``70a08231``

Returns number of tokens owned by given address

.. _inputs-2:

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

issue(\ *address* ``_for``, *uint256* ``outcomeTokenCount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``867904b4``

Events contract issues new tokens for address. Returns success

.. _inputs-3:

Inputs
^^^^^^

+-----------+-----------------------+---------------------------+
| type      | name                  | description               |
+===========+=======================+===========================+
| *address* | ``_for``              | Address of receiver       |
+-----------+-----------------------+---------------------------+
| *uint256* | ``outcomeTokenCount`` | Number of tokens to issue |
+-----------+-----------------------+---------------------------+

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

revoke(\ *address* ``_for``, *uint256* ``outcomeTokenCount``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``eac449d9``

Events contract revokes tokens for address. Returns success

.. _inputs-6:

Inputs
^^^^^^

+-----------+-----------------------+----------------------------+
| type      | name                  | description                |
+===========+=======================+============================+
| *address* | ``_for``              | Address of token holder    |
+-----------+-----------------------+----------------------------+
| *uint256* | ``outcomeTokenCount`` | Number of tokens to revoke |
+-----------+-----------------------+----------------------------+
