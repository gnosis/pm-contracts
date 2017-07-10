Gnosis Smart Contracts
======================

[![Logo](assets/logo.png)](https://gnosis.pm/)

[![Build Status](https://travis-ci.org/gnosis/gnosis-contracts.svg?branch=master)](https://travis-ci.org/gnosis/gnosis-contracts)

[![Greenkeeper badge](https://badges.greenkeeper.io/gnosis/gnosis-contracts.svg)](https://greenkeeper.io/)

[![Slack Status](https://slack.gnosis.pm/badge.svg)](https://slack.gnosis.pm)

Collection of smart contracts for the Gnosis prediction market platform (https://www.gnosis.pm).
To interact with those contracts have a look at (https://github.com/gnosis/gnosis.js/).

Install
-------
### Install requirements with npm:

```bash
npm install
```

Testing and Linting
-------------------
### Run all tests (requires Node version >=7 for `async/await`, and will automatically run TestRPC in the background):

```bash
npm test
```

### Lint the JS

```bash
npm run lint
```

Compile and Deploy
------------------
These commands apply to the RPC provider running on port 8545. You may want to have TestRPC running in the background. They are really wrappers around the [corresponding Truffle commands](http://truffleframework.com/docs/advanced/commands).

### Compile all contracts to obtain ABI and bytecode:

```bash
npm run compile
```

### Migrate all contracts required for the basic framework onto network associated with RPC provider:

```bash
npm run migrate
```

Network Artifacts
-----------------

### Show the deployed addresses of all contracts on all networks:

```bash
npm run networks
```

Command line options for `truffle` can be passed down through NPM by preceding the options list with `--`. For example:

### Clean network artifacts:

```bash
npm run networks -- --clean
```

Network artifacts from running migrations will contain addresses of deployed contracts on the Kovan and Rinkeby testnets.

### Take network info from `networks.json` and inject it into contract build artifacts. This is done prepublish as well.

```bash
npm run injectnetinfo
```

### Extract all network information into `networks.json`.

Be aware that this will clobber `networks.json`, so be careful with this command:

```bash
npm run extractnetinfo
```

Security and Liability
----------------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

License
-------
All smart contracts are released under GPL v.3.

Contributors
------------
- Stefan George ([Georgi87](https://github.com/Georgi87))
- Martin Koeppelmann ([koeppelmann](https://github.com/koeppelmann))
- Alan Lu ([cag](https://github.com/cag))
- Roland Kofler ([rolandkofler](https://github.com/rolandkofler))
- Collin Chin ([collinc97](https://github.com/collinc97))
