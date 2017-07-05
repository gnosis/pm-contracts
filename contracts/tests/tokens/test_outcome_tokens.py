from ..abstract_test import AbstractTestContracts, accounts, keys

class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')
        self.outcome_token_abi = self.create_abi('Tokens/OutcomeToken.sol')

    def test_gas_cost_issue_revoke(self):
        outcome_token = self.create_contract('Tokens/OutcomeToken.sol', libraries={'Math': self.math})
        # Issuing for the first time
        with self.gas_counter() as gc:
            outcome_token.issue(accounts[0], 500000)
        self.assertEqual(66510L, gc.gas_cost())

        with self.gas_counter() as gc:
            outcome_token.issue(accounts[0], 500000)
        self.assertEqual(36510L, gc.gas_cost())

        with self.gas_counter() as gc:
            outcome_token.issue(accounts[1], 500000)
        self.assertEqual(51510L, gc.gas_cost())

        # Revoking to non-zero
        with self.gas_counter() as gc:
            outcome_token.revoke(accounts[0], 500000)
        self.assertEqual(36756L, gc.gas_cost())        

        # Revoking to 0 (get gas refund for clearing the storage)
        with self.gas_counter() as gc:
            outcome_token.revoke(accounts[0], 500000)
        self.assertEqual(18378L, gc.gas_cost())

