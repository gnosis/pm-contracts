from codecs import decode
from ..abstract_test import AbstractTestContract, accounts, keys


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.markets.test_buy_and_sell
    """

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/DefaultMarketFactory.sol')
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.ether_token = self.create_contract('Tokens/EtherToken.sol')
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.market_abi = self.create_abi('Markets/DefaultMarket.sol')
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')

    def test(self):
        # Create event
        description_hash = decode("d621d969951b20c5cf2008cbfc282a2d496ddfe75a76afe7b6b32f1470b8a449", 'hex')
        oracle_address = self.centralized_oracle_factory.createCentralizedOracle(description_hash)
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
        # Buy outcome tokens
        buyer = 1
        outcome = 0
        token_count = 10**15
        outcome_token_costs = self.lmsr.calcCosts(market.address, outcome, token_count)
        fee = market.calcMarketFee(outcome_token_costs)
        self.assertEqual(fee, outcome_token_costs * 105 // 100 - outcome_token_costs)
        costs = outcome_token_costs + fee
        self.ether_token.deposit(value=costs, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), costs)
        self.ether_token.approve(market.address, costs, sender=keys[buyer])
        self.assertEqual(market.buy(outcome, token_count, costs, sender=keys[buyer]), costs)
        outcome_token = self.contract_at(event.outcomeTokens(outcome), self.token_abi)
        self.assertEqual(outcome_token.balanceOf(accounts[buyer]), token_count)
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), 0)
        # Sell outcome tokens
        outcome_token_profits = self.lmsr.calcProfits(market.address, outcome, token_count)
        fee = market.calcMarketFee(outcome_token_profits)
        profits = outcome_token_profits - fee
        outcome_token.approve(market.address, token_count, sender=keys[buyer])
        self.assertEqual(market.sell(outcome, token_count, profits, sender=keys[buyer]), profits)
        self.assertEqual(outcome_token.balanceOf(accounts[buyer]), 0)
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), profits)
