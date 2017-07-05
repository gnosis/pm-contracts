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
        gas_costs_1 = []
        gas_costs_2 = []
        for num_outcomes in xrange(2, 14):
            event_address = self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes)
            event = self.contract_at(event_address, self.event_abi)
            # Buy all outcomes
            buyer = 0
            collateral_token_count = 10
            self.ether_token.deposit(value=collateral_token_count, sender=keys[buyer])
            self.ether_token.approve(event_address, collateral_token_count, sender=keys[buyer])
            with self.gas_counter() as gc:
                event.buyAllOutcomes(collateral_token_count/2, sender=keys[buyer])
            gas_costs_1.append(gc.gas_cost())
            with self.gas_counter() as gc:
                event.buyAllOutcomes(collateral_token_count/2, sender=keys[buyer])
            gas_costs_2.append(gc.gas_cost())
        self.assertEqual([147594L,191822L,236050L,280278L,324506L,368734L,412962L,457190L,501418L,
                          545646L,589874L,634102L], gas_costs_1)
        self.assertEquals([42594L,56822L,71050L,85278L,99506L,113734L,127962L,142190L,156418L,
                           170646L,184874L,199102L], gas_costs_2)

    def test_gas_cost_sell_all_outcomes(self):
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        gas_costs_1 = []
        gas_costs_2 = []
        collateral_token_count = 10
        buyer = 0
        self.ether_token.deposit(value=collateral_token_count, sender=keys[buyer])
        for num_outcomes in xrange(2, 14):
            event_address = self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes)
            event = self.contract_at(event_address, self.event_abi)
            self.ether_token.approve(event_address, collateral_token_count, sender=keys[buyer])
            event.buyAllOutcomes(collateral_token_count, sender=keys[buyer])
            with self.gas_counter() as gc:
                event.sellAllOutcomes(collateral_token_count/2, sender=keys[buyer])
            gas_costs_1.append(gc.gas_cost())
            with self.gas_counter() as gc:
                event.sellAllOutcomes(collateral_token_count/2, sender=keys[buyer])
            gas_costs_2.append(gc.gas_cost())
        self.assertEqual([81914L,96388L,110862L,125336L,139810L,154284L,168758L,183232L,197706L,
                          212180L,226654L,241128L], gas_costs_1)
        self.assertEqual([33457L,40694L,47931L,55168L,62405L,69642L,76879L,84116L,91353L,
                          98590L,105827L,113064L], gas_costs_2)

    def test_get_outcome_tokens(self):
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)

        gas_costs = []
        for num_outcomes in xrange(2, 14):
            event_address = self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes)
            event = self.contract_at(event_address, self.event_abi)
            with self.gas_counter() as gc:
               outcome_tokens = event.getOutcomeTokens()
            gas_costs.append(gc.gas_cost())
            self.assertEqual(num_outcomes, len(outcome_tokens))
        self.assertEquals([22610L, 22839L, 23068L, 23297L, 23526L, 23755L, 23985L, 24214L, 24443L,
                           24672L, 24901L, 25131L], gas_costs)

    def test_get_outcome_token_distribution(self):
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
            event.buyAllOutcomes(collateral_token_count, sender=keys[buyer])
            distribution = event.getOutcomeTokenDistribution(accounts[buyer])
            with self.gas_counter() as gc:
                distribution = event.getOutcomeTokenDistribution(accounts[buyer])
            gas_costs.append(gc.gas_cost())
            self.assertEqual([collateral_token_count] * num_outcomes, distribution)
        self.assertEqual([25898L, 27190L, 28482L, 29774L, 31066L, 32358L, 33651L, 34943L, 36235L,
                          37527L, 38819L, 40112L], gas_costs)

