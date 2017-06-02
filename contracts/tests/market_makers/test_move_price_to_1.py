from ..abstract_test import AbstractTestContracts, accounts, keys


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/DefaultMarketFactory.sol', libraries={'Math': self.math})
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.market_abi = self.create_abi('Markets/DefaultMarket.sol')
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')

    def test(self):
        for funding, token_count in [
            (10*10**18, 100 * 10 ** 18),
            (1, 10),
            (10**20, 10 ** 21),
            (1, 10 ** 21),
        ]:
            ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
            # Create event
            ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
            oracle_address = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
            event = self.contract_at(self.event_factory.createCategoricalEvent(ether_token.address, oracle_address, 2), self.event_abi)
            # Create market
            fee = 0  # 0%
            market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
            # Fund market
            investor = 0
            ether_token.deposit(value=funding, sender=keys[investor])
            self.assertEqual(ether_token.balanceOf(accounts[investor]), funding)
            ether_token.approve(market.address, funding, sender=keys[investor])
            market.fund(funding, sender=keys[investor])
            self.assertEqual(ether_token.balanceOf(accounts[investor]), 0)
            # User buys ether tokens
            trader = 1
            outcome = 1
            loop_count = 10
            ether_token.deposit(value=token_count * loop_count, sender=keys[trader])
            # User buys outcome tokens from market maker
            costs = None
            for i in range(loop_count):
                # Calculate profit for selling tokens
                costs = self.lmsr.calcCosts(market.address, outcome, token_count)
                # Buying tokens
                ether_token.approve(market.address, token_count, sender=keys[trader])
                self.assertEqual(market.buy(outcome, token_count, costs, sender=keys[trader]), costs)
            # Price is equal to 1
            self.assertEqual(costs, token_count)
