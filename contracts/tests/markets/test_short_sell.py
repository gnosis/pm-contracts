from ..abstract_test import AbstractTestContracts, accounts, keys


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
        oracle_address = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle_address, 2), self.event_abi)
        # Create market
        fee = 50000  # 5%
        market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
        # Fund market
        investor = 0
        funding = 10**18
        self.ether_token.deposit(value=funding, sender=keys[investor])
        self.assertEqual(self.ether_token.balanceOf(accounts[investor]), funding)
        self.ether_token.approve(market.address, funding, sender=keys[investor])
        market.fund(funding, sender=keys[investor])
        self.assertEqual(self.ether_token.balanceOf(accounts[investor]), 0)
        # Short sell outcome tokens
        buyer = 1
        outcome = 0
        opposite_outcome = 1
        token_count = 10**15
        outcome_token_profit = self.lmsr.calcProfit(market.address, outcome, token_count)
        fee = market.calcMarketFee(outcome_token_profit)
        cost = token_count - outcome_token_profit + fee
        self.ether_token.deposit(value=token_count, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), token_count)
        self.ether_token.approve(market.address, token_count, sender=keys[buyer])
        self.assertEqual(market.shortSell(outcome, token_count, outcome_token_profit - fee, sender=keys[buyer]), cost)
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), token_count - cost)
        outcome_token = self.contract_at(event.outcomeTokens(opposite_outcome), self.token_abi)
        self.assertEqual(outcome_token.balanceOf(accounts[buyer]), token_count)

    def test_gas_cost_short_sell(self):
       # Create event
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle_address = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        gas_costs = []
        for num_outcomes in xrange(2,14):
            event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle_address, num_outcomes), self.event_abi)
            # Create market
            fee = 50000  # 5%
            market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
            # Fund market
            investor = 0
            funding = 10**18
            self.ether_token.deposit(value=funding, sender=keys[investor])
            self.assertEqual(self.ether_token.balanceOf(accounts[investor]), funding)
            self.ether_token.approve(market.address, funding, sender=keys[investor])
            market.fund(funding, sender=keys[investor])
            self.assertEqual(self.ether_token.balanceOf(accounts[investor]), 0)
            # Short sell outcome tokens
            buyer = 1
            outcome = 0
            opposite_outcome = 1
            token_count = 10**15
            outcome_token_profit = self.lmsr.calcProfit(market.address, outcome, token_count)
            fee = market.calcMarketFee(outcome_token_profit)
            cost = token_count - outcome_token_profit + fee
            self.ether_token.deposit(value=token_count, sender=keys[buyer])
            self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), token_count)
            self.ether_token.approve(market.address, token_count, sender=keys[buyer])
            with self.gas_counter(account=accounts[buyer]) as gc:
                self.assertEqual(market.shortSell(outcome, token_count, outcome_token_profit - fee, sender=keys[buyer]), cost)
            gas_costs.append(gc.gas_cost())
            self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), token_count - cost)
            outcome_token = self.contract_at(event.outcomeTokens(opposite_outcome), self.token_abi)
            self.assertEqual(outcome_token.balanceOf(accounts[buyer]), token_count)
            # Clean up for the next iteration
            self.ether_token.withdraw(self.ether_token.balanceOf(accounts[investor]), sender=keys[investor])
            self.assertEqual(self.ether_token.balanceOf(accounts[investor]), 0)
            self.ether_token.withdraw(self.ether_token.balanceOf(accounts[buyer]), sender=keys[buyer])
            self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), 0)
        self.assertEqual([324562L,396027L,467448L,538933L,610419L,681904L,753379L,824844L,896329L,
                          967815L,1039236L,1110785L], gas_costs)

