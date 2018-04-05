CampaignFactory
===============

-  `CampaignFactory <#campaignfactory>`__

   -  `Events <#events>`__

      -  `CampaignCreation <#campaigncreation-address-indexed-creator-address-campaign-address-eventcontract-address-marketfactory-address-marketmaker-uint24-fee-uint256-funding-uint256-deadline>`__\ (*address*
         indexed ``creator``, *address* ``campaign``, *address*
         ``eventContract``, *address* ``marketFactory``, *address*
         ``marketMaker``, *uint24* ``fee``, *uint256* ``funding``,
         *uint256* ``deadline``)

   -  `Functions <#functions>`__

      -  `createCampaign <#createcampaign-address-eventcontract-address-marketfactory-address-marketmaker-uint24-fee-uint256-funding-uint256-deadline>`__\ (*address*
         ``eventContract``, *address* ``marketFactory``, *address*
         ``marketMaker``, *uint24* ``fee``, *uint256* ``funding``,
         *uint256* ``deadline``)

Campaign factory contract - Allows to create campaign contracts
---------------------------------------------------------------

-  **Author**: Stefan George - stefan@gnosis.pm
-  **Constructor**: CampaignFactory()
-  This contract does **not** have a fallback function.

Events
------

CampaignCreation(\ *address* indexed ``creator``, *address* ``campaign``, *address* ``eventContract``, *address* ``marketFactory``, *address* ``marketMaker``, *uint24* ``fee``, *uint256* ``funding``, *uint256* ``deadline``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Signature hash**:
``7a9fd19b658538a67209802dd9011d6e3ce04586fe93c87096d2bc40ed850866``

Functions
---------

createCampaign(\ *address* ``eventContract``, *address* ``marketFactory``, *address* ``marketMaker``, *uint24* ``fee``, *uint256* ``funding``, *uint256* ``deadline``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **State mutability**: ``nonpayable``
-  **Signature hash**: ``7d1ef569``

Creates a new campaign contract

Inputs
^^^^^^

+-----------+-------------------+----------------------------+
| type      | name              | description                |
+===========+===================+============================+
| *address* | ``eventContract`` | Event contract             |
+-----------+-------------------+----------------------------+
| *address* | ``marketFactory`` | Market factory contract    |
+-----------+-------------------+----------------------------+
| *address* | ``marketMaker``   | Market maker contract      |
+-----------+-------------------+----------------------------+
| *uint24*  | ``fee``           | Market fee                 |
+-----------+-------------------+----------------------------+
| *uint256* | ``funding``       | Initial funding for market |
+-----------+-------------------+----------------------------+
| *uint256* | ``deadline``      | Campaign deadline          |
+-----------+-------------------+----------------------------+

Outputs
^^^^^^^

+-----------+--------------+-----------------+
| type      | name         | description     |
+===========+==============+=================+
| *address* | ``campaign`` | Market contract |
+-----------+--------------+-----------------+
