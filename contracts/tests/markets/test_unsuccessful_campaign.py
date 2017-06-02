from ..abstract_test import AbstractTestContracts, keys


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.event_factory = self.create_contract('Events/EventFactory.sol', libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.market_factory = self.create_contract('Markets/DefaultMarketFactory.sol', libraries={'Math': self.math})
        self.campaign_factory = self.create_contract('Markets/CampaignFactory.sol', libraries={'Math': self.math})
        self.lmsr = self.create_contract('MarketMakers/LMSRMarketMaker.sol', libraries={'Math': self.math})
        self.ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
        self.token_abi = self.create_abi('Tokens/AbstractToken.sol')
        self.event_abi = self.create_abi('Events/AbstractEvent.sol')
        self.oracle_abi = self.create_abi('Oracles/CentralizedOracle.sol')
        self.campaign_abi = self.create_abi('Markets/Campaign.sol')

    def test(self):
        # Create event
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash), self.oracle_abi)
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
        # Deadline passes
        self.s.block.timestamp = deadline + 1
        self.assertEqual(campaign.refund(sender=keys[backer_1]), amount)
        self.assertEqual(campaign.refund(sender=keys[backer_1]), 0)
