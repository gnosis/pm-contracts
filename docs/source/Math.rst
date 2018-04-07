Math
====

-  `Math <#math>`__

   -  `Accessors <#accessors>`__
   -  `Functions <#functions>`__

      -  `safeToMul <#safetomul-int256-a-int256-b>`__\ (*int256* ``a``,
         *int256* ``b``)
      -  `ln <#ln-uint256-x>`__\ (*uint256* ``x``)
      -  `floorLog2 <#floorlog2-uint256-x>`__\ (*uint256* ``x``)
      -  `safeToAdd <#safetoadd-uint256-a-uint256-b>`__\ (*uint256*
         ``a``, *uint256* ``b``)
      -  `add <#add-uint256-a-uint256-b>`__\ (*uint256* ``a``, *uint256*
         ``b``)
      -  `safeToSub <#safetosub-int256-a-int256-b>`__\ (*int256* ``a``,
         *int256* ``b``)
      -  `add <#add-int256-a-int256-b>`__\ (*int256* ``a``, *int256*
         ``b``)
      -  `sub <#sub-int256-a-int256-b>`__\ (*int256* ``a``, *int256*
         ``b``)
      -  `sub <#sub-uint256-a-uint256-b>`__\ (*uint256* ``a``, *uint256*
         ``b``)
      -  `mul <#mul-int256-a-int256-b>`__\ (*int256* ``a``, *int256*
         ``b``)
      -  `mul <#mul-uint256-a-uint256-b>`__\ (*uint256* ``a``, *uint256*
         ``b``)
      -  `safeToMul <#safetomul-uint256-a-uint256-b>`__\ (*uint256*
         ``a``, *uint256* ``b``)
      -  `max <#max-int256-nums>`__\ (*int256[]* ``nums``)
      -  `safeToAdd <#safetoadd-int256-a-int256-b>`__\ (*int256* ``a``,
         *int256* ``b``)
      -  `safeToSub <#safetosub-uint256-a-uint256-b>`__\ (*uint256*
         ``a``, *uint256* ``b``)
      -  `exp <#exp-int256-x>`__\ (*int256* ``x``)

Math library - Allows calculation of logarithmic and exponential functions
--------------------------------------------------------------------------

-  **Author**: Alan Lu - alan.lu@gnosis.pm\ Stefan George -
   stefan@gnosis.pm
-  **Constructor**: Math()
-  This contract does **not** have a fallback function.

Accessors
---------

-  *uint256* LN2() ``02780677``
-  *uint256* LOG2_E() ``24902e24``
-  *uint256* ONE() ``c2ee3a08``

Functions
---------

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
