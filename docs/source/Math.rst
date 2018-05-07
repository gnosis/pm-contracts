-  `Math <#math>`__

   -  `Accessors <#math-accessors>`__
   -  `Functions <#math-functions>`__

      -  `safeToMul(\ *int256* ``a``, *int256*
         ``b``) <#safetomulint256-a-int256-b>`__
      -  `ln(\ *uint256* ``x``) <#lnuint256-x>`__
      -  `floorLog2(\ *uint256* ``x``) <#floorlog2uint256-x>`__
      -  `safeToAdd(\ *uint256* ``a``, *uint256*
         ``b``) <#safetoadduint256-a-uint256-b>`__
      -  `add(\ *uint256* ``a``, *uint256*
         ``b``) <#adduint256-a-uint256-b>`__
      -  `safeToSub(\ *int256* ``a``, *int256*
         ``b``) <#safetosubint256-a-int256-b>`__
      -  `add(\ *int256* ``a``, *int256*
         ``b``) <#addint256-a-int256-b>`__
      -  `sub(\ *int256* ``a``, *int256*
         ``b``) <#subint256-a-int256-b>`__
      -  `sub(\ *uint256* ``a``, *uint256*
         ``b``) <#subuint256-a-uint256-b>`__
      -  `mul(\ *int256* ``a``, *int256*
         ``b``) <#mulint256-a-int256-b>`__
      -  `mul(\ *uint256* ``a``, *uint256*
         ``b``) <#muluint256-a-uint256-b>`__
      -  `safeToMul(\ *uint256* ``a``, *uint256*
         ``b``) <#safetomuluint256-a-uint256-b>`__
      -  `max(\ *int256[]* ``nums``) <#maxint256-nums>`__
      -  `safeToAdd(\ *int256* ``a``, *int256*
         ``b``) <#safetoaddint256-a-int256-b>`__
      -  `safeToSub(\ *uint256* ``a``, *uint256*
         ``b``) <#safetosubuint256-a-uint256-b>`__
      -  `exp(\ *int256* ``x``) <#expint256-x>`__

Math
====

Math library - Allows calculation of logarithmic and exponential functions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Author**: Alan Lu - alan.lu@gnosis.pm\ Stefan George -
   stefan@gnosis.pm
-  **Constructor**: Math()
-  This contract does **not** have a fallback function.

Math Accessors
--------------

-  *uint256* LN2() ``02780677``
-  *uint256* LOG2_E() ``24902e24``
-  *uint256* ONE() ``c2ee3a08``

Math Functions
--------------

safeToMul(\ *int256* ``a``, *int256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``1f47ba29``

Returns whether a multiply operation causes an overflow

Inputs
^^^^^^

+----------+-------+---------------+
| type     | name  | description   |
+==========+=======+===============+
| *int256* | ``a`` | First factor  |
+----------+-------+---------------+
| *int256* | ``b`` | Second factor |
+----------+-------+---------------+

Outputs
^^^^^^^

+--------+------------------------+
| type   | description            |
+========+========================+
| *bool* | Did no overflow occur? |
+--------+------------------------+

ln(\ *uint256* ``x``)
~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``24d4e90a``

Returns natural logarithm value of given x

.. _inputs-1:

Inputs
^^^^^^

+-----------+-------+-------------+
| type      | name  | description |
+===========+=======+=============+
| *uint256* | ``x`` | x           |
+-----------+-------+-------------+

.. _outputs-1:

Outputs
^^^^^^^

+----------+-------------+
| type     | description |
+==========+=============+
| *int256* | ln(x)       |
+----------+-------------+

floorLog2(\ *uint256* ``x``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``45b8bafc``

Returns base 2 logarithm value of given x

.. _inputs-2:

Inputs
^^^^^^

+-----------+-------+-------------+
| type      | name  | description |
+===========+=======+=============+
| *uint256* | ``x`` | x           |
+-----------+-------+-------------+

.. _outputs-2:

Outputs
^^^^^^^

+----------+--------+-------------------+
| type     | name   | description       |
+==========+========+===================+
| *int256* | ``lo`` | logarithmic value |
+----------+--------+-------------------+

safeToAdd(\ *uint256* ``a``, *uint256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``4e30a66c``

Returns whether an add operation causes an overflow

.. _inputs-3:

Inputs
^^^^^^

+-----------+-------+---------------+
| type      | name  | description   |
+===========+=======+===============+
| *uint256* | ``a`` | First addend  |
+-----------+-------+---------------+
| *uint256* | ``b`` | Second addend |
+-----------+-------+---------------+

.. _outputs-3:

Outputs
^^^^^^^

+--------+------------------------+
| type   | description            |
+========+========================+
| *bool* | Did no overflow occur? |
+--------+------------------------+

add(\ *uint256* ``a``, *uint256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``771602f7``

Returns sum if no overflow occurred

.. _inputs-4:

Inputs
^^^^^^

+-----------+-------+---------------+
| type      | name  | description   |
+===========+=======+===============+
| *uint256* | ``a`` | First addend  |
+-----------+-------+---------------+
| *uint256* | ``b`` | Second addend |
+-----------+-------+---------------+

.. _outputs-4:

Outputs
^^^^^^^

+-----------+-------------+
| type      | description |
+===========+=============+
| *uint256* | Sum         |
+-----------+-------------+

safeToSub(\ *int256* ``a``, *int256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``90304341``

Returns whether a subtraction operation causes an underflow

.. _inputs-5:

Inputs
^^^^^^

+----------+-------+-------------+
| type     | name  | description |
+==========+=======+=============+
| *int256* | ``a`` | Minuend     |
+----------+-------+-------------+
| *int256* | ``b`` | Subtrahend  |
+----------+-------+-------------+

.. _outputs-5:

Outputs
^^^^^^^

+--------+-------------------------+
| type   | description             |
+========+=========================+
| *bool* | Did no underflow occur? |
+--------+-------------------------+

add(\ *int256* ``a``, *int256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``a5f3c23b``

Returns sum if no overflow occurred

.. _inputs-6:

Inputs
^^^^^^

+----------+-------+---------------+
| type     | name  | description   |
+==========+=======+===============+
| *int256* | ``a`` | First addend  |
+----------+-------+---------------+
| *int256* | ``b`` | Second addend |
+----------+-------+---------------+

.. _outputs-6:

Outputs
^^^^^^^

+----------+-------------+
| type     | description |
+==========+=============+
| *int256* | Sum         |
+----------+-------------+

sub(\ *int256* ``a``, *int256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``adefc37b``

Returns difference if no overflow occurred

.. _inputs-7:

Inputs
^^^^^^

+----------+-------+-------------+
| type     | name  | description |
+==========+=======+=============+
| *int256* | ``a`` | Minuend     |
+----------+-------+-------------+
| *int256* | ``b`` | Subtrahend  |
+----------+-------+-------------+

.. _outputs-7:

Outputs
^^^^^^^

+----------+-------------+
| type     | description |
+==========+=============+
| *int256* | Difference  |
+----------+-------------+

sub(\ *uint256* ``a``, *uint256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``b67d77c5``

Returns difference if no overflow occurred

.. _inputs-8:

Inputs
^^^^^^

+-----------+-------+-------------+
| type      | name  | description |
+===========+=======+=============+
| *uint256* | ``a`` | Minuend     |
+-----------+-------+-------------+
| *uint256* | ``b`` | Subtrahend  |
+-----------+-------+-------------+

.. _outputs-8:

Outputs
^^^^^^^

+-----------+-------------+
| type      | description |
+===========+=============+
| *uint256* | Difference  |
+-----------+-------------+

mul(\ *int256* ``a``, *int256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``bbe93d91``

Returns product if no overflow occurred

.. _inputs-9:

Inputs
^^^^^^

+----------+-------+---------------+
| type     | name  | description   |
+==========+=======+===============+
| *int256* | ``a`` | First factor  |
+----------+-------+---------------+
| *int256* | ``b`` | Second factor |
+----------+-------+---------------+

.. _outputs-9:

Outputs
^^^^^^^

+----------+-------------+
| type     | description |
+==========+=============+
| *int256* | Product     |
+----------+-------------+

mul(\ *uint256* ``a``, *uint256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``c8a4ac9c``

Returns product if no overflow occurred

.. _inputs-10:

Inputs
^^^^^^

+-----------+-------+---------------+
| type      | name  | description   |
+===========+=======+===============+
| *uint256* | ``a`` | First factor  |
+-----------+-------+---------------+
| *uint256* | ``b`` | Second factor |
+-----------+-------+---------------+

.. _outputs-10:

Outputs
^^^^^^^

+-----------+-------------+
| type      | description |
+===========+=============+
| *uint256* | Product     |
+-----------+-------------+

safeToMul(\ *uint256* ``a``, *uint256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``cb10fa76``

Returns whether a multiply operation causes an overflow

.. _inputs-11:

Inputs
^^^^^^

+-----------+-------+---------------+
| type      | name  | description   |
+===========+=======+===============+
| *uint256* | ``a`` | First factor  |
+-----------+-------+---------------+
| *uint256* | ``b`` | Second factor |
+-----------+-------+---------------+

.. _outputs-11:

Outputs
^^^^^^^

+--------+------------------------+
| type   | description            |
+========+========================+
| *bool* | Did no overflow occur? |
+--------+------------------------+

max(\ *int256[]* ``nums``)
~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``ccc13814``

Returns maximum of an array

.. _inputs-12:

Inputs
^^^^^^

+------------+----------+-------------------------+
| type       | name     | description             |
+============+==========+=========================+
| *int256[]* | ``nums`` | Numbers to look through |
+------------+----------+-------------------------+

.. _outputs-12:

Outputs
^^^^^^^

+----------+---------+----------------+
| type     | name    | description    |
+==========+=========+================+
| *int256* | ``max`` | Maximum number |
+----------+---------+----------------+

safeToAdd(\ *int256* ``a``, *int256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``dc08a80b``

Returns whether an add operation causes an overflow

.. _inputs-13:

Inputs
^^^^^^

+----------+-------+---------------+
| type     | name  | description   |
+==========+=======+===============+
| *int256* | ``a`` | First addend  |
+----------+-------+---------------+
| *int256* | ``b`` | Second addend |
+----------+-------+---------------+

.. _outputs-13:

Outputs
^^^^^^^

+--------+------------------------+
| type   | description            |
+========+========================+
| *bool* | Did no overflow occur? |
+--------+------------------------+

safeToSub(\ *uint256* ``a``, *uint256* ``b``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``e31c71c4``

Returns whether a subtraction operation causes an underflow

.. _inputs-14:

Inputs
^^^^^^

+-----------+-------+-------------+
| type      | name  | description |
+===========+=======+=============+
| *uint256* | ``a`` | Minuend     |
+-----------+-------+-------------+
| *uint256* | ``b`` | Subtrahend  |
+-----------+-------+-------------+

.. _outputs-14:

Outputs
^^^^^^^

+--------+-------------------------+
| type   | description             |
+========+=========================+
| *bool* | Did no underflow occur? |
+--------+-------------------------+

exp(\ *int256* ``x``)
~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``view``
-  **Signature hash**: ``e46751e3``

Returns natural exponential function value of given x

.. _inputs-15:

Inputs
^^^^^^

+----------+-------+-------------+
| type     | name  | description |
+==========+=======+=============+
| *int256* | ``x`` | x           |
+----------+-------+-------------+

.. _outputs-15:

Outputs
^^^^^^^

+-----------+-------------+
| type      | description |
+===========+=============+
| *uint256* | e**x        |
+-----------+-------------+
