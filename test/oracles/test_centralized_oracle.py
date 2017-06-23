from codecs import encode
from ..abstract_test import AbstractTestContracts, accounts, keys, TransactionFailed


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.oracle_abi = self.create_abi('Oracles/CentralizedOracle.sol')

    def test(self):
        # Create oracles
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        owner_1 = 0
        owner_2 = 1
        oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash, sender=keys[owner_1]),
                                  self.oracle_abi)
        # Replace account resolving outcome
        self.assertEqual(oracle.owner(), encode(accounts[owner_1], 'hex'))
        oracle.replaceOwner(accounts[owner_2], sender=keys[owner_1])
        self.assertEqual(oracle.owner(), encode(accounts[owner_2], 'hex'))
        # Set outcome
        self.assertRaises(TransactionFailed, oracle.setOutcome, 0, sender=keys[owner_1])
        self.assertFalse(oracle.isOutcomeSet())
        oracle.setOutcome(1, sender=keys[owner_2])
        self.assertTrue(oracle.isOutcomeSet())
        self.assertEqual(oracle.getOutcome(), 1)
        self.assertEqual(oracle.ipfsHash(), ipfs_hash)
