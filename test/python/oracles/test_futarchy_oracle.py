from ..abstract_test import AbstractTestContracts, accounts, keys, TransactionFailed
from ethereum import tester as t


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/StandardMarketFactory.sol', libraries={'Math': self.math})
        self.futarchy_factory = self.create_contract('Oracles/FutarchyOracleFactory.sol', libraries={'Math': self.math}, params=[self.event_factory])
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
        self.token_abi = self.create_abi('Tokens/Token.sol')
        self.market_abi = self.create_abi('Markets/StandardMarket.sol')
        self.event_abi = self.create_abi('Events/Event.sol')
        self.oracle_abi = self.create_abi('Oracles/CentralizedOracle.sol')
        self.futarchy_abi = self.create_abi('Oracles/FutarchyOracle.sol')

    def test(self):
        t.gas_limit = 4712388*4  # Creation gas cost is above gas limit!!!
        # Create futarchy oracle
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash), self.oracle_abi)
        fee = 50000  # 5%
        lower = -100
        upper = 100
        deadline = self.s.block.timestamp + 60*60  # in 1h
        creator = 0
        profiling = self.futarchy_factory.createFutarchyOracle(self.ether_token.address, oracle.address, 2, lower, upper,
                                                               self.market_factory.address, self.lmsr.address, fee,
                                                               deadline, sender=keys[creator], profiling=True)
        self.assertLess(profiling['gas'], 20000000)
        futarchy = self.contract_at(profiling['output'], self.futarchy_abi)
        categorical_event = self.contract_at(futarchy.categoricalEvent(), self.event_abi)
        # Fund markets
        collateral_token_count = 10**18
        self.ether_token.deposit(value=collateral_token_count, sender=keys[creator])
        self.assertEqual(self.ether_token.balanceOf(accounts[creator]), collateral_token_count)
        self.ether_token.approve(futarchy.address, collateral_token_count, sender=keys[creator])
        futarchy.fund(collateral_token_count, sender=keys[creator])
        # Buy into market for outcome token 1
        market = self.contract_at(futarchy.markets(1), self.market_abi)
        buyer = 1
        outcome = 1
        token_count = 10 ** 15
        outcome_token_cost = self.lmsr.calcCost(market.address, outcome, token_count)
        fee = market.calcMarketFee(outcome_token_cost)
        cost = outcome_token_cost + fee
        # Buy all outcomes
        self.ether_token.deposit(value=cost, sender=keys[buyer])
        self.ether_token.approve(categorical_event.address, cost, sender=keys[buyer])
        categorical_event.buyAllOutcomes(cost, sender=keys[buyer])
        collateral_token = self.contract_at(categorical_event.outcomeTokens(1), self.token_abi)
        collateral_token.approve(market.address, cost, sender=keys[buyer])
        self.assertEqual(market.buy(outcome, token_count, cost, sender=keys[buyer]), cost)
        # Set outcome of futarchy oracle
        self.assertRaises(TransactionFailed, futarchy.setOutcome)
        self.s.block.timestamp = deadline
        futarchy.setOutcome()
        self.assertTrue(futarchy.isOutcomeSet())
        self.assertEqual(futarchy.getOutcome(), 1)
        categorical_event.setOutcome()
        # Set winning outcome for scalar events
        self.assertRaises(TransactionFailed, futarchy.close)
        oracle.setOutcome(-50)
        scalar_event = self.contract_at(market.eventContract(), self.event_abi)
        scalar_event.setOutcome()
        # Close winning market and transfer collateral tokens to creator
        futarchy.close(sender=keys[creator])
        self.assertGreater(self.ether_token.balanceOf(accounts[creator]), collateral_token_count)
