SignedMessageOracle
===================

-  `SignedMessageOracle <#signedmessageoracle>`__

   -  `Accessors <#accessors>`__
   -  `Events <#events>`__

      -  `SignerReplacement <#signerreplacement-address-indexed-newsigner>`__\ (*address*
         indexed ``newSigner``)
      -  `OutcomeAssignment <#outcomeassignment-int256-outcome>`__\ (*int256*
         ``outcome``)

   -  `Functions <#functions>`__

      -  `replaceSigner <#replacesigner-address-newsigner-uint256-_nonce-uint8-v-bytes32-r-bytes32-s>`__\ (*address*
         ``newSigner``, *uint256* ``_nonce``, *uint8* ``v``, *bytes32*
         ``r``, *bytes32* ``s``)
      -  `getOutcome <#getoutcome>`__\ ()
      -  `isOutcomeSet <#isoutcomeset>`__\ ()
      -  `setOutcome <#setoutcome-int256-_outcome-uint8-v-bytes32-r-bytes32-s>`__\ (*int256*
         ``_outcome``, *uint8* ``v``, *bytes32* ``r``, *bytes32* ``s``)

Signed message oracle contract - Allows to set an outcome with a signed message
-------------------------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: SignedMessageOracle(\ *bytes32*
   ``_descriptionHash``, *uint8* ``v``, *bytes32* ``r``, *bytes32*
   ``s``)
-  This contract does **not** have a fallback function.

Accessors
---------

-  *address* signer() ``238ac933``
-  *int256* outcome() ``27793f87``
-  *bytes32* descriptionHash() ``85dcee93``
-  *bool* isSet() ``c65fb380``

Events
------

SignerReplacement(\ *address* indexed ``newSigner``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``db3046afd053bee6427d6355ee95671fceb37ee6b944866f9ea86eaa213dac68``

OutcomeAssignment(\ *int256* ``outcome``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``b1aaa9f4484acc283375c8e495a44766e4026170797dc9280b4ae2ab5632fb71``

Functions
---------

replaceSigner(\ *address* ``newSigner``, *uint256* ``_nonce``, *uint8* ``v``, *bytes32* ``r``, *bytes32* ``s``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``5011e399``

Replaces signer

Inputs
^^^^^^

+-----------+---------------+----------------------------------------+
| type      | name          | description                            |
+===========+===============+========================================+
| *address* | ``newSigner`` | New signer                             |
+-----------+---------------+----------------------------------------+
| *uint256* | ``_nonce``    | Unique nonce to prevent replay attacks |
+-----------+---------------+----------------------------------------+
| *uint8*   | ``v``         | Signature parameter                    |
+-----------+---------------+----------------------------------------+
| *bytes32* | ``r``         | Signature parameter                    |
+-----------+---------------+----------------------------------------+
| *bytes32* | ``s``         | Signature parameter                    |
+-----------+---------------+----------------------------------------+

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

isOutcomeSet()
~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``ccdf68f3``

Returns if winning outcome

.. _outputs-1:

Outputs
^^^^^^^

+--------+-----------------+
| type   | description     |
+========+=================+
| *bool* | Is outcome set? |
+--------+-----------------+

setOutcome(\ *int256* ``_outcome``, *uint8* ``v``, *bytes32* ``r``, *bytes32* ``s``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``d9bf3187``

Sets outcome based on signed message

.. _inputs-1:

Inputs
^^^^^^

+-----------+--------------+----------------------+
| type      | name         | description          |
+===========+==============+======================+
| *int256*  | ``_outcome`` | Signed event outcome |
+-----------+--------------+----------------------+
| *uint8*   | ``v``        | Signature parameter  |
+-----------+--------------+----------------------+
| *bytes32* | ``r``        | Signature parameter  |
+-----------+--------------+----------------------+
| *bytes32* | ``s``        | Signature parameter  |
+-----------+--------------+----------------------+
