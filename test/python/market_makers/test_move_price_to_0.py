from ..abstract_test import AbstractTestContracts, accounts, keys
from ..math_utils import isclose, lmsr_marginal_price, mpf, ONE


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/StandardMarketFactory.sol', libraries={'Math': self.math})
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
        self.token_abi = self.create_abi('Tokens/Token.sol')
        self.market_abi = self.create_abi('Markets/StandardMarket.sol')
        self.event_abi = self.create_abi('Events/Event.sol')

    def test(self):
        # Create event
        num_outcomes = 2
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle_address = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle_address, num_outcomes), self.event_abi)
        # Create market
        fee = 0  # 0%
        market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
        # Fund market
        investor = 0
        funding = 10*10**18
        self.ether_token.deposit(value=funding, sender=keys[investor])
        self.assertEqual(self.ether_token.balanceOf(accounts[investor]), funding)
        self.ether_token.approve(market.address, funding, sender=keys[investor])
        market.fund(funding, sender=keys[investor])
        self.assertEqual(self.ether_token.balanceOf(accounts[investor]), 0)
        # User buys all outcomes
        trader = 1
        outcome = 1
        token_count = 100 * 10 ** 18  # 100 Ether
        loop_count = 10
        self.ether_token.deposit(value=token_count * loop_count, sender=keys[trader])
        self.ether_token.approve(event.address, token_count * loop_count, sender=keys[trader])
        event.buyAllOutcomes(token_count * loop_count, sender=keys[trader])
        # User sells tokens
        buyer_balance = self.ether_token.balanceOf(accounts[trader])
        profit = None
        for i in range(loop_count):
            # Calculate profit for selling tokens
            profit = self.lmsr.calcProfit(market.address, outcome, token_count)
            if profit == 0:
                break
            # Selling tokens
            outcome_token = self.contract_at(event.outcomeTokens(outcome), self.token_abi)
            outcome_token.approve(market.address, token_count, sender=keys[trader])
            self.assertEqual(market.sell(outcome, token_count, profit, sender=keys[trader]), profit)
            net_outcome_tokens_sold = [market.netOutcomeTokensSold(i) for i in range(num_outcomes)]
            expected = lmsr_marginal_price(funding, net_outcome_tokens_sold, outcome)
            actual = mpf(self.lmsr.calcMarginalPrice(market.address, outcome)) / ONE
            assert (i, funding, net_outcome_tokens_sold) and isclose(expected, actual, abs_tol=1e-18)

        # Selling of tokens is worth less than 1 Wei
        self.assertEqual(profit, 0)
        # User's Ether balance increased
        self.assertGreater(self.ether_token.balanceOf(accounts[trader]), buyer_balance)
