Gnosis Smart Contracts
===================

<img src="assets/logo.png" />

[![Slack Status](http://slack.gnosis.pm/badge.svg)](http://slack.gnosis.pm)

Collection of smart contracts for the Gnosis prediction market platform (https://www.gnosis.pm).
To interact with those contracts have a look at (https://github.com/gnosis/gnosis.js/).
A documentation can be found ([here](https://github.com/gnosis/gnosis-contracts/blob/master/CONTRACTS.md))).

Install
-------------
### Install requirements with pip:
```
git clone https://github.com/gnosis/gnosis-contracts.git
cd gnosis-contracts
pip install -r requirements.txt
```

### Install virtual machine environment via vagrant:
```
cd gnosis-contracts
vagrant up
```

Test
-------------
### Run all tests:
```
cd gnosis-contracts
python -m unittest discover contracts.tests
```

### Run one test:
```
cd gnosis-contracts
python -m unittest contracts.tests.test_name
```

Deploy
-------------
### Deploy all contracts required for the basic framework:
```
cd gnosis-contracts/contracts/
python ethdeploy.py --f deploy/basicFramework.json --optimize
```

Security and Liability
-------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

License
-------------
All smart contracts are released under GPL v.3.

Contributors
-------------
- Stefan George ([Georgi87](https://github.com/Georgi87))
- Martin Koeppelmann ([koeppelmann](https://github.com/koeppelmann))
- Alan Lu ([cag](https://github.com/cag))
