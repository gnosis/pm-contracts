Contributing
============

Install
-------

Install requirements with npm:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm install

Testing and Linting
-------------------

Run all tests (requires Node version >=7 for ``async/await``\ , and will automatically run TestRPC in the background):
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm test

Run all tests matching a regexp pattern by setting the ``TEST_GREP`` environment variable
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   TEST_GREP='short selling' npm test

Lint the JS
^^^^^^^^^^^

.. code-block:: bash

   npm run lint

Compile and Deploy
------------------

These commands apply to the RPC provider running on port 8545. You may want to have TestRPC running in the background. They are really wrappers around the `corresponding Truffle commands <http://truffleframework.com/docs/advanced/commands>`_.

Compile all contracts to obtain ABI and bytecode:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm run compile

Migrate all contracts required for the basic framework onto network associated with RPC provider:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm run migrate

Network Artifacts
-----------------

Show the deployed addresses of all contracts on all networks:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm run networks

Command line options for ``truffle`` can be passed down through NPM by preceding the options list with ``--``. For example:

Clean network artifacts:
^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm run networks -- --clean

Network artifacts from running migrations will contain addresses of deployed contracts on the Kovan and Rinkeby testnets.

Take network info from ``networks.json`` and inject it into contract build artifacts. This is done prepublish as well.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm run injectnetinfo

Extract all network information into ``networks.json``.
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Be aware that this will clobber ``networks.json``\ , so be careful with this command:

.. code-block:: bash

   npm run extractnetinfo

Gas Measurements
----------------

Log gas measurements into ``build/gas-stats.json``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

   npm run measuregasstats

Locally build docs for readthedocs
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Will install `Sphinx <http://www.sphinx-doc.org/en/stable/>`_ and `Solidity Domain for Sphinx <https://github.com/cag/sphinxcontrib-soliditydomain/>`_\ :

.. code-block:: bash

   cd docs
   pip install -r requirements.txt
   make html


Contributors
------------


* Stefan George (\ `Georgi87 <https://github.com/Georgi87>`_\ )
* Martin Koeppelmann (\ `koeppelmann <https://github.com/koeppelmann>`_\ )
* Alan Lu (\ `cag <https://github.com/cag>`_\ )
* Roland Kofler (\ `rolandkofler <https://github.com/rolandkofler>`_\ )
* Collin Chin (\ `collinc97 <https://github.com/collinc97>`_\ )
* Christopher Gewecke (\ `cgewecke <https://github.com/cgewecke>`_\ )
