from ..abstract_test import AbstractTestContracts, accounts, keys, TransactionFailed


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/StandardMarketFactory.sol', libraries={'Math': self.math})
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.market_abi = self.create_abi('Markets/StandardMarket.sol')
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')

    def test(self):
        # Create event
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, 2), self.event_abi)
        # Create market
        fee = 0
        market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
        # Fund market
        buyer = 0
        funding = 100
        self.ether_token.deposit(value=funding, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), funding)
        self.ether_token.approve(market.address, funding, sender=keys[buyer])
        market.fund(funding, sender=keys[buyer])
        # Market can only be funded once
        self.ether_token.deposit(value=funding, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), funding)
        self.ether_token.approve(market.address, funding, sender=keys[buyer])
        self.assertRaises(TransactionFailed, market.fund, funding, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), funding)
        # Close market
        market.close(sender=keys[buyer])
        # Market can only be closed once
        self.assertRaises(TransactionFailed, market.close, sender=keys[buyer])
        # Sell all outcomes
        event.sellAllOutcomes(funding, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), funding * 2)

    def test_gas_cost_creation(self):
        # Create event
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        gas_costs = []
        for num_outcomes in xrange(2, 14):
            event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes), self.event_abi)
            # Create market
            fee = 0
            with self.gas_counter() as gc:
                self.market_factory.createMarket(event.address, self.lmsr.address, fee)
            gas_costs.append(gc.gas_cost())
        self.assertEqual([1690607L, 1695677L, 1700747L, 1705817L, 1710887L, 1715893L, 1721027L, 1726097L, 1731167L,
                          1736237L, 1741243L, 1746377L], gas_costs)

    def test_gas_cost_close(self):
        # Create event
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        gas_costs = []
        for num_outcomes in xrange(2, 14):
            event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, num_outcomes), self.event_abi)
            # Create market
            fee = 0
            market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
            # Fund market
            buyer = 0
            funding = 100
            self.ether_token.deposit(value=funding, sender=keys[buyer])
            self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), funding)
            self.ether_token.approve(market.address, funding, sender=keys[buyer])
            market.fund(funding, sender=keys[buyer])
            # Close market
            with self.gas_counter() as gc:
                market.close(sender=keys[buyer])
            gas_costs.append(gc.gas_cost())
        self.assertEqual([63604L, 81222L, 98840L, 116458L, 134076L, 151694L, 169312L, 186930L, 204548L,
                          222166L, 239784L, 257402L], gas_costs)

