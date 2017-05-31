from ..abstract_test import AbstractTestContracts, accounts, keys
import math


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/DefaultMarketFactory.sol')
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.ether_token = self.create_contract('Tokens/EtherToken.sol')
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.market_abi = self.create_abi('Markets/DefaultMarket.sol')
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')

    @staticmethod
    def calc_token_count(token_count, token_index, token_distribution, funding):
        _max = max(token_distribution)
        token_distribution = [_max - x for x in token_distribution]
        b = funding / float(math.log(len(token_distribution)))
        return b * math.log(
            sum([math.exp(share_count / b + token_count / b) for share_count in token_distribution]) -
            sum([math.exp(share_count / b) for index, share_count in enumerate(token_distribution) if index != token_index])
        ) - token_distribution[token_index]

    def test(self):
        # Create event
        ipfs_hash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle_address = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
        event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle_address, 2), self.event_abi)
        # Create market
        fee = 50000  # 5%
        market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
        # Fund market
        investor = 0
        funding = 10*10**18
        self.ether_token.deposit(value=funding, sender=keys[investor])
        self.assertEqual(self.ether_token.balanceOf(accounts[investor]), funding)
        self.ether_token.approve(market.address, funding, sender=keys[investor])
        market.fund(funding, sender=keys[investor])
        self.assertEqual(self.ether_token.balanceOf(accounts[investor]), 0)
        # Calculating costs for buying shares and earnings for selling shares
        outcome = 1
        token_distribution = [funding, funding]
        outcome_token_count = 5 * 10 ** 18
        costs = self.lmsr.calcCosts(market.address, outcome, outcome_token_count)
        approx_number_of_shares = self.calc_token_count(costs, outcome, token_distribution, funding)
        self.assertAlmostEqual(outcome_token_count / approx_number_of_shares, 1, places=3)
