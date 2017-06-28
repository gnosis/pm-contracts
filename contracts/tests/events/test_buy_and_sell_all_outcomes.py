from ..abstract_test import AbstractTestContracts, accounts, keys

class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')

    def test(self):
        # Create event
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        event_address = self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, 2)
        event = self.contract_at(event_address, self.event_abi)
        # Buy all outcomes
        buyer = 0
        collateral_token_count = 10
        self.ether_token.deposit(value=collateral_token_count, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), collateral_token_count)
        self.ether_token.approve(event_address, collateral_token_count, sender=keys[buyer])
        event.buyAllOutcomes(collateral_token_count, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(event_address), collateral_token_count)
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), 0)
        outcome_token_1 = self.contract_at(event.outcomeTokens(0), self.token_abi)
        outcome_token_2 = self.contract_at(event.outcomeTokens(1), self.token_abi)
        self.assertEqual(outcome_token_1.balanceOf(accounts[buyer]), collateral_token_count)
        self.assertEqual(outcome_token_2.balanceOf(accounts[buyer]), collateral_token_count)
        # Sell all outcomes
        event.sellAllOutcomes(collateral_token_count, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), collateral_token_count)
        self.assertEqual(self.ether_token.balanceOf(event_address), 0)
        self.assertEqual(outcome_token_1.balanceOf(accounts[buyer]), 0)
        self.assertEqual(outcome_token_2.balanceOf(accounts[buyer]), 0)

    def test_gas_cost_of_creation(self):
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)

        gas_costs = []
        for num_outcomes in xrange(2, 14):
            with self.gas_counter() as gc:
               self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes)
            gas_costs.append(gc.gas_cost())
        self.assertEqual([2033497L, 2666345L, 3299193L, 3932041L, 4564889L, 5197737L, 5830585L,
                        6463433L, 7096281L, 7729129L, 8361977L, 8994825L], gas_costs)

    def test_gas_cost_buy_all_outcomes(self):
        # Create event
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        gas_costs = []
        for num_outcomes in xrange(2, 14):
            event_address = self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes)
            event = self.contract_at(event_address, self.event_abi)
            # Buy all outcomes
            buyer = 0
            collateral_token_count = 10
            self.ether_token.deposit(value=collateral_token_count, sender=keys[buyer])
            self.ether_token.approve(event_address, collateral_token_count, sender=keys[buyer])
            with self.gas_counter() as gc:
                event.buyAllOutcomes(collateral_token_count, sender=keys[buyer])
            gas_costs.append(gc.gas_cost())
        self.assertEqual([117594L, 161822L, 206050L, 250278L, 294506L, 338734L, 382962L, 427190L, 471418L,
                515646L, 559874L, 604102L], gas_costs)


    def test_gas_cost_sell_all_outcomes(self):
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        gas_costs = []
        collateral_token_count = 10
        buyer = 0
        self.ether_token.deposit(value=collateral_token_count, sender=keys[buyer])
        for num_outcomes in xrange(2, 14):
            event_address = self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes)
            event = self.contract_at(event_address, self.event_abi)
            self.ether_token.approve(event_address, collateral_token_count, sender=keys[buyer])
            event.buyAllOutcomes(collateral_token_count, sender=keys[buyer])
            with self.gas_counter() as gc:
                event.sellAllOutcomes(collateral_token_count, sender=keys[buyer])
            gas_costs.append(gc.gas_cost())
        self.assertEqual([40957L, 48194L, 55431L, 62668L, 69905L, 77142L, 84379L, 91616L, 98853L,
                          106090L, 113327L, 120564L], gas_costs)

