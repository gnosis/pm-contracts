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
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        owner_1 = 0
        owner_2 = 1
        owner_3 = 1
        oracle_1 = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash, sender=keys[owner_1]),
                                    self.centralized_oracle_abi)
        oracle_2 = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash, sender=keys[owner_2]),
                                    self.centralized_oracle_abi)
        oracle_3 = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash, sender=keys[owner_3]),
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

    def test_gas_cost_creation(self):
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        gas_costs = []
        for num_suboracles in xrange(3, 14):
            sub_oracle_addrs = []
            for i in xrange(num_suboracles):
                oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash, sender=keys[0]),
                                    self.centralized_oracle_abi)
                sub_oracle_addrs.append(oracle.address)
            with self.gas_counter() as gc:
                self.majority_oracle_factory.createMajorityOracle(sub_oracle_addrs)
            gas_costs.append(gc.gas_cost())
        self.assertEqual([373533L, 395696L, 417922L, 440213L, 462375L, 484666L, 506892L, 529119L,
                          551345L, 573572L, 595670L], gas_costs)

    def test_gas_cost_get_status_same_outcome(self):
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        gas_costs = []
        for num_suboracles in xrange(3, 14):
            sub_oracles = []
            sub_oracle_addrs = []
            for i in xrange(num_suboracles):
                oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash, sender=keys[0]),
                                    self.centralized_oracle_abi)
                sub_oracle_addrs.append(oracle.address)
                sub_oracles.append(oracle)
            majority_oracle = self.contract_at(self.majority_oracle_factory.createMajorityOracle(sub_oracle_addrs), self.majority_oracle_abi)
            for oracle in sub_oracles:
                oracle.setOutcome(1, sender=keys[0])
            with self.gas_counter() as gc:
                majority_oracle.getStatusAndOutcome()
            gas_costs.append(gc.gas_cost())
        self.assertEqual([29294L, 31553L, 33812L, 36071L, 38331L, 40590L, 42849L, 45108L, 47367L, 49627L, 51886L], gas_costs)

    def test_gas_cost_get_status_diff_outcomes(self):
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        gas_costs = []
        for num_suboracles in xrange(3, 14):
            sub_oracles = []
            sub_oracle_addrs = []
            for i in xrange(num_suboracles):
                oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash, sender=keys[0]),
                                    self.centralized_oracle_abi)
                sub_oracle_addrs.append(oracle.address)
                sub_oracles.append(oracle)
            majority_oracle = self.contract_at(self.majority_oracle_factory.createMajorityOracle(sub_oracle_addrs), self.majority_oracle_abi)
            for i, oracle in enumerate(sub_oracles):
                oracle.setOutcome(i, sender=keys[0])
            with self.gas_counter() as gc:
                majority_oracle.getStatusAndOutcome()
            gas_costs.append(gc.gas_cost())
        self.assertEqual([30034L, 33110L, 36411L, 39937L, 43689L, 47665L, 51866L, 56292L, 60943L, 65820L, 70921L], gas_costs)

