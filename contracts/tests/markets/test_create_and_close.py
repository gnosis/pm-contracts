from codecs import decode
from ..abstract_test import AbstractTestContracts, accounts, keys


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

    def test(self):
        # Create event
        description_hash = decode("d621d969951b20c5cf2008cbfc282a2d496ddfe75a76afe7b6b32f1470b8a449", 'hex')
        oracle = self.centralized_oracle_factory.createCentralizedOracle(description_hash)
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
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), 0)
        # Close market
        market.close(sender=keys[buyer])
        event.sellAllOutcomes(funding, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), funding)
