-  `DifficultyOracle <#difficultyoracle>`__

   -  `Accessors <#difficultyoracle-accessors>`__
   -  `Events <#difficultyoracle-events>`__

      -  `OutcomeAssignment(\ *uint256*
         ``difficulty``) <#outcomeassignmentuint256-difficulty>`__

   -  `Functions <#difficultyoracle-functions>`__

      -  `setOutcome() <#setoutcome>`__
      -  `getOutcome() <#getoutcome>`__
      -  `isOutcomeSet() <#isoutcomeset>`__

DifficultyOracle
================

Difficulty oracle contract - Oracle to resolve difficulty events at given block
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: DifficultyOracle(\ *uint256* ``_blockNumber``)
-  This contract does **not** have a fallback function.

DifficultyOracle Accessors
--------------------------

-  *uint256* difficulty() ``19cae462``
-  *uint256* blockNumber() ``57e871e7``

DifficultyOracle Events
-----------------------

OutcomeAssignment(\ *uint256* ``difficulty``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``39972cb21edd888c2061a2b4b37874524bbc055cfeaa3054682ba5369f5029aa``

DifficultyOracle Functions
--------------------------

setOutcome()
~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``0537665d``

Sets difficulty as winning outcome for specified block

getOutcome()
~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``7e7e4b47``

Returns difficulty

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

Returns if difficulty is set

.. _outputs-1:

Outputs
^^^^^^^

+--------+-----------------+
| type   | description     |
+========+=================+
| *bool* | Is outcome set? |
+--------+-----------------+
