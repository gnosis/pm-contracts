-  `HumanFriendlyToken <#humanfriendlytoken>`__

   -  `Accessors <#humanfriendlytoken-accessors>`__
   -  `Events <#humanfriendlytoken-events>`__

      -  `Transfer(\ *address* indexed ``from``, *address* indexed
         ``to``, *uint256*
         ``value``) <#transferaddress-indexed-from-address-indexed-to-uint256-value>`__
      -  `Approval(\ *address* indexed ``owner``, *address* indexed
         ``spender``, *uint256*
         ``value``) <#approvaladdress-indexed-owner-address-indexed-spender-uint256-value>`__

   -  `Functions <#humanfriendlytoken-functions>`__

      -  `approve(\ *address* ``spender``, *uint256*
         ``value``) <#approveaddress-spender-uint256-value>`__
      -  `transferFrom(\ *address* ``from``, *address* ``to``, *uint256*
         ``value``) <#transferfromaddress-from-address-to-uint256-value>`__
      -  `balanceOf(\ *address* ``owner``) <#balanceofaddress-owner>`__
      -  `transfer(\ *address* ``to``, *uint256*
         ``value``) <#transferaddress-to-uint256-value>`__
      -  `allowance(\ *address* ``owner``, *address*
         ``spender``) <#allowanceaddress-owner-address-spender>`__

HumanFriendlyToken
==================

Abstract human-friendly token contract - Functions to be implemented by token contracts
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Constructor**: HumanFriendlyToken()
-  This contract does **not** have a fallback function.

HumanFriendlyToken Accessors
----------------------------

-  *string* name() ``06fdde03``
-  *uint256* totalSupply() ``18160ddd``
-  *uint8* decimals() ``313ce567``
-  *string* symbol() ``95d89b41``

HumanFriendlyToken Events
-------------------------

Transfer(\ *address* indexed ``from``, *address* indexed ``to``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef``

Approval(\ *address* indexed ``owner``, *address* indexed ``spender``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925``

HumanFriendlyToken Functions
----------------------------

approve(\ *address* ``spender``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``095ea7b3``

Inputs
^^^^^^

+-----------+-------------+
| type      | name        |
+===========+=============+
| *address* | ``spender`` |
+-----------+-------------+
| *uint256* | ``value``   |
+-----------+-------------+

Outputs
^^^^^^^

+--------+
| type   |
+========+
| *bool* |
+--------+

transferFrom(\ *address* ``from``, *address* ``to``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``23b872dd``

.. _inputs-1:

Inputs
^^^^^^

+-----------+-----------+
| type      | name      |
+===========+===========+
| *address* | ``from``  |
+-----------+-----------+
| *address* | ``to``    |
+-----------+-----------+
| *uint256* | ``value`` |
+-----------+-----------+

.. _outputs-1:

Outputs
^^^^^^^

+--------+
| type   |
+========+
| *bool* |
+--------+

balanceOf(\ *address* ``owner``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``70a08231``

.. _inputs-2:

Inputs
^^^^^^

+-----------+-----------+
| type      | name      |
+===========+===========+
| *address* | ``owner`` |
+-----------+-----------+

.. _outputs-2:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+

transfer(\ *address* ``to``, *uint256* ``value``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``a9059cbb``

.. _inputs-3:

Inputs
^^^^^^

+-----------+-----------+
| type      | name      |
+===========+===========+
| *address* | ``to``    |
+-----------+-----------+
| *uint256* | ``value`` |
+-----------+-----------+

.. _outputs-3:

Outputs
^^^^^^^

+--------+
| type   |
+========+
| *bool* |
+--------+

allowance(\ *address* ``owner``, *address* ``spender``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``dd62ed3e``

.. _inputs-4:

Inputs
^^^^^^

+-----------+-------------+
| type      | name        |
+===========+=============+
| *address* | ``owner``   |
+-----------+-------------+
| *address* | ``spender`` |
+-----------+-------------+

.. _outputs-4:

Outputs
^^^^^^^

+-----------+
| type      |
+===========+
| *uint256* |
+-----------+
