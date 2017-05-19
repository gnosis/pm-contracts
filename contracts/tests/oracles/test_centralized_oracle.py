from ..abstract_test import AbstractTestContract, accounts, keys, TransactionFailed


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.oracles.test_centralized_oracle
    """

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.oracle_abi = self.create_abi('Oracles/CentralizedOracle.sol')

    def test(self):
        # Create oracles
        description_hash = "d621d969951b20c5cf2008cbfc282a2d496ddfe75a76afe7b6b32f1470b8a449".decode('hex')
        owner_1 = 0
        owner_2 = 1
        oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(description_hash, sender=keys[owner_1]),
                                  self.oracle_abi)
        # Replace account resolving outcome
        self.assertEqual(oracle.owner(), accounts[owner_1].encode('hex'))
        oracle.replaceOwner(accounts[owner_2], sender=keys[owner_1])
        self.assertEqual(oracle.owner(), accounts[owner_2].encode('hex'))
        # Set outcome
        self.assertRaises(TransactionFailed, oracle.setOutcome, 0, sender=keys[owner_1])
        self.assertFalse(oracle.isOutcomeSet())
        oracle.setOutcome(1, sender=keys[owner_2])
        self.assertTrue(oracle.isOutcomeSet())
        self.assertEqual(oracle.getOutcome(), 1)
