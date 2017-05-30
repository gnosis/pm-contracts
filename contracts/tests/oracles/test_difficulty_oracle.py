from ..abstract_test import AbstractTestContracts, TransactionFailed


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.difficulty_oracle_factory = self.create_contract('Oracles/DifficultyOracleFactory.sol')
        self.oracle_abi = self.create_abi('Oracles/DifficultyOracle.sol')

    def test(self):
        # Create oracle
        block_number = self.s.block.number + 100
        oracle = self.contract_at(self.difficulty_oracle_factory.createDifficultyOracle(block_number), self.oracle_abi)
        # Set outcome
        self.assertRaises(TransactionFailed, oracle.setOutcome)
        self.assertFalse(oracle.isOutcomeSet())
        # Wait until block 100
        self.s.mine(100)
        oracle.setOutcome()
        self.assertTrue(oracle.isOutcomeSet())
        self.assertGreater(oracle.getOutcome(), 0)
