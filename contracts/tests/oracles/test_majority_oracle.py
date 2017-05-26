from codecs import decode
from ..abstract_test import AbstractTestContracts, keys


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.majority_oracle_factory = self.create_contract('Oracles/MajorityOracleFactory.sol')
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.majority_oracle_abi = self.create_abi('Oracles/MajorityOracle.sol')
        self.centralized_oracle_abi = self.create_abi('Oracles/CentralizedOracle.sol')

    def test(self):
        # Create oracles
        description_hash = decode("d621d969951b20c5cf2008cbfc282a2d496ddfe75a76afe7b6b32f1470b8a449", 'hex')
        owner_1 = 0
        owner_2 = 1
        owner_3 = 1
        oracle_1 = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(description_hash, sender=keys[owner_1]),
                                    self.centralized_oracle_abi)
        oracle_2 = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(description_hash, sender=keys[owner_2]),
                                    self.centralized_oracle_abi)
        oracle_3 = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(description_hash, sender=keys[owner_3]),
                                    self.centralized_oracle_abi)
        majority_oracle = self.contract_at(self.majority_oracle_factory.createMajorityOracle([oracle_1.address, oracle_2.address, oracle_3.address]),
                                           self.majority_oracle_abi)
        # Majority oracle cannot be resolved yet
        self.assertFalse(majority_oracle.isOutcomeSet())
        # Set outcome in first centralized oracle
        oracle_1.setOutcome(1, sender=keys[owner_1])
        # Majority vote is not reached yet
        self.assertFalse(majority_oracle.isOutcomeSet())
        # Set outcome in second centralized oracle
        oracle_2.setOutcome(1, sender=keys[owner_2])
        # Majority vote is reached
        self.assertTrue(majority_oracle.isOutcomeSet())
        self.assertEqual(majority_oracle.getOutcome(), 1)
