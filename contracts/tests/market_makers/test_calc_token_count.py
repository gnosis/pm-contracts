from codecs import decode
from ..abstract_test import AbstractTestContract, accounts, keys
from ..math_utils import isclose, mp, mpf
from codecs import decode
import math


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.market_makers.test_calc_token_count
    """

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/DefaultMarketFactory.sol')
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.market_abi = self.create_abi('Markets/DefaultMarket.sol')
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')

    @staticmethod
    def calc_cost(funding, net_outcome_tokens_sold, outcome, outcome_token_count):
        b = mpf(funding) / mp.log(len(net_outcome_tokens_sold))
        return b * (
            mp.log(sum(
                mp.exp((tokens_sold + (outcome_token_count if i == outcome else 0)) / b)
                for i, tokens_sold in enumerate(net_outcome_tokens_sold)
            )) -
            mp.log(sum(
                mp.exp(tokens_sold / b)
                for tokens_sold in net_outcome_tokens_sold
            ))
        )

    def test(self):
        for funding, outcome_token_count in [
            (10*10**18, 5 * 10 ** 18),
            (10, 5),
            (10*10**18, 5000),
            (10*10**18, 5),
            (10, 5 * 10 ** 18),
        ]:
            ether_token = self.create_contract('Tokens/EtherToken.sol')
            # Create event
            description_hash = decode("d621d969951b20c5cf2008cbfc282a2d496ddfe75a76afe7b6b32f1470b8a449", 'hex')
            oracle_address = self.centralized_oracle_factory.createCentralizedOracle(description_hash)
            event = self.contract_at(self.event_factory.createCategoricalEvent(ether_token.address, oracle_address, 2), self.event_abi)
            # Create market
            fee = 50000  # 5%
            market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
            # Fund market
            investor = 0
            ether_token.deposit(value=funding, sender=keys[investor])
            self.assertEqual(ether_token.balanceOf(accounts[investor]), funding)
            ether_token.approve(market.address, funding, sender=keys[investor])
            market.fund(funding, sender=keys[investor])
            self.assertEqual(ether_token.balanceOf(accounts[investor]), 0)
            # Calculating costs for buying shares and earnings for selling shares
            outcome = 1
            token_distribution = [funding, funding]

            actual = self.lmsr.calcCosts(market.address, outcome, outcome_token_count)
            expected = self.calc_cost(funding, [0, 0], outcome, outcome_token_count)

            assert (
                (funding, outcome_token_count) is not None and
                isclose(actual, mp.ceil(expected), abs_tol=1)
            )
