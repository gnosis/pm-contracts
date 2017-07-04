from ..abstract_test import AbstractTestContracts, accounts, keys
from ..math_utils import isclose, mp, mpf
import math


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/StandardMarketFactory.sol', libraries={'Math': self.math})
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.market_abi = self.create_abi('Markets/StandardMarket.sol')
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
            ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
            # Create event
            ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
            oracle_address = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
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
            # Calculating cost for buying shares and earnings for selling shares
            outcome = 1
            actual = self.lmsr.calcCost(market.address, outcome, outcome_token_count)
            expected = self.calc_cost(funding, [0, 0], outcome, outcome_token_count)
            assert (
                (funding, outcome_token_count) is not None and
                isclose(actual, mp.ceil(expected), abs_tol=1)
            )

    def test_gas_costs(self):
        for funding, outcome_token_count in [
            (10*10**18, 5 * 10 ** 18),
            (10, 5),
            (10*10**18, 5000),
            (10*10**18, 5),
            (10, 5 * 10 ** 18),
        ]:
            ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
            # Create event
            ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
            oracle_address = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
            gas_costs_1 = []
            gas_costs_2 = []
            for num_outcomes in xrange(2,14):
                event = self.contract_at(self.event_factory.createCategoricalEvent(ether_token.address, oracle_address, num_outcomes), self.event_abi)
                # Create market
                fee = 50000  # 5%
                market = self.contract_at(self.market_factory.createMarket(event.address, self.lmsr.address, fee), self.market_abi)
                # Fund market
                investor = 0
                ether_token.deposit(value=funding, sender=keys[investor])
                self.assertEqual(ether_token.balanceOf(accounts[investor]), funding)
                ether_token.approve(market.address, funding, sender=keys[investor])
                market.fund(funding, sender=keys[investor])
                # Calculating cost for buying shares and earnings for selling shares
                outcome = 1
                with self.gas_counter() as gc:
                     self.lmsr.calcCost(market.address, outcome, outcome_token_count)
                gas_costs_1.append(gc.gas_cost())
                with self.gas_counter() as gc:
                     self.lmsr.calcProfit(market.address, outcome, outcome_token_count)
                gas_costs_2.append(gc.gas_cost())
            #self.assertEqual([76867L,88860L,100873L,112886L,124900L,136849L,148916L,160919L,172932L,
            #                  184946L,196959L,208908L], gas_costs_1)
            self.assertEqual([76715L,88708L,100721L,112734L,124748L,136697L,148764L,160757L,172770L,
                              184784L,196797L,208746L], gas_costs_2)

