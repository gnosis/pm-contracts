CentralizedOracle
=================

-  `CentralizedOracle <#centralizedoracle>`__

   -  `Accessors <#accessors>`__
   -  `Events <#events>`__

      -  `OwnerReplacement <#ownerreplacement-address-indexed-newowner>`__\ (*address*
         indexed ``newOwner``)
      -  `OutcomeAssignment <#outcomeassignment-int256-outcome>`__\ (*int256*
         ``outcome``)

   -  `Functions <#functions>`__

      -  `setOutcome <#setoutcome-int256-_outcome>`__\ (*int256*
         ``_outcome``)
      -  `getOutcome <#getoutcome>`__\ ()
      -  `replaceOwner <#replaceowner-address-newowner>`__\ (*address*
         ``newOwner``)
      -  `isOutcomeSet <#isoutcomeset>`__\ ()

Centralized oracle contract - Allows the contract owner to set an outcome
-------------------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: CentralizedOracle(\ *address* ``_owner``, *bytes*
   ``_ipfsHash``)
-  This contract does **not** have a fallback function.

Accessors
---------

-  *int256* outcome() ``27793f87``
-  *address* owner() ``8da5cb5b``
-  *bytes* ipfsHash() ``c623674f``
-  *bool* isSet() ``c65fb380``

Events
------

OwnerReplacement(\ *address* indexed ``newOwner``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``191a2405c52452c381a62f3b7480f9d3e77a76d7737659fc1030aff54b395dd5``

OutcomeAssignment(\ *int256* ``outcome``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``b1aaa9f4484acc283375c8e495a44766e4026170797dc9280b4ae2ab5632fb71``

Functions
---------

setOutcome(\ *int256* ``_outcome``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``717a195a``

Sets event outcome

Inputs
^^^^^^

+----------+--------------+---------------+
| type     | name         | description   |
+==========+==============+===============+
| *int256* | ``_outcome`` | Event outcome |
+----------+--------------+---------------+

getOutcome()
~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``7e7e4b47``

Returns outcome

Outputs
^^^^^^^

+----------+-------------+
| type     | description |
+==========+=============+
| *int256* | Outcome     |
+----------+-------------+

replaceOwner(\ *address* ``newOwner``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``a39a45b7``

Replaces owner

.. _inputs-1:

Inputs
^^^^^^

+-----------+--------------+-------------+
| type      | name         | description |
+===========+==============+=============+
| *address* | ``newOwner`` | New owner   |
+-----------+--------------+-------------+

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
