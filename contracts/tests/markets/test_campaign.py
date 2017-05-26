from codecs import decode
from ..abstract_test import AbstractTestContracts, accounts, keys


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/DefaultMarketFactory.sol')
        self.campaign_factory = self.create_contract('Markets/CampaignFactory.sol')
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.ether_token = self.create_contract('Tokens/EtherToken.sol')
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.market_abi = self.create_abi('Markets/DefaultMarket.sol')
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')
        self.oracle_abi = self.create_abi('Oracles/CentralizedOracle.sol')
        self.campaign_abi = self.create_abi('Markets/Campaign.sol')

    def test(self):
        # Create event
        description_hash = decode("d621d969951b20c5cf2008cbfc282a2d496ddfe75a76afe7b6b32f1470b8a449", 'hex')
        oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(description_hash), self.oracle_abi)
        event = self.contract_at(self.event_factory.createCategoricalEvent(self.ether_token.address, oracle.address, 2), self.event_abi)
        # Create campaign
        fee = 50000  # 5%
        funding = 10**18
        deadline = self.s.block.timestamp + 60*60  # in 1h
        campaign = self.contract_at(self.campaign_factory.createCampaigns(event.address, self.market_factory.address,
                                                                          self.lmsr.address, fee, funding, deadline),
                                    self.campaign_abi)
        self.assertEqual(campaign.stage(), 0)
        # Fund campaign
        backer_1 = 0
        amount = 10**18 // 4 * 3
        self.ether_token.deposit(value=amount, sender=keys[backer_1])
        self.ether_token.approve(campaign.address, amount, sender=keys[backer_1])
        campaign.fund(amount, sender=keys[backer_1])
        self.assertEqual(campaign.stage(), 0)
        backer_2 = 1
        amount = 10 ** 18 // 4
        self.ether_token.deposit(value=amount, sender=keys[backer_2])
        self.ether_token.approve(campaign.address, amount, sender=keys[backer_2])
        campaign.fund(amount, sender=keys[backer_2])
        self.assertEqual(campaign.stage(), 1)
        # Create market
        market = self.contract_at(campaign.createMarket(), self.market_abi)
        # Trade
        buyer = 2
        outcome = 0
        token_count = 10 ** 15
        outcome_token_costs = self.lmsr.calcCosts(market.address, outcome, token_count)
        fee = market.calcMarketFee(outcome_token_costs)
        self.assertEqual(fee, outcome_token_costs * 105 // 100 - outcome_token_costs)
        costs = outcome_token_costs + fee
        self.ether_token.deposit(value=costs, sender=keys[buyer])
        self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), costs)
        self.ether_token.approve(market.address, costs, sender=keys[buyer])
        self.assertEqual(market.buy(outcome, token_count, costs, sender=keys[buyer]), costs)
        # Set outcome
        oracle.setOutcome(1)
        event.setWinningOutcome()
        # Withdraw fees
        campaign.withdrawFeesFromMarket()
        final_balance = campaign.finalBalance()
        self.assertGreater(final_balance, funding)
        self.assertEqual(campaign.withdrawFeesFromCampaign(sender=keys[backer_1]) // 100, final_balance // 4 * 3 // 100)
        self.assertEqual(campaign.withdrawFeesFromCampaign(sender=keys[backer_2]) // 100, final_balance // 4 // 100)
        # Withdraw works only once
        self.assertEqual(campaign.withdrawFeesFromCampaign(sender=keys[backer_1]), 0)
        self.assertEqual(campaign.withdrawFeesFromCampaign(sender=keys[backer_2]), 0)
