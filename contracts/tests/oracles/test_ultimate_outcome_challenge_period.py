from ..abstract_test import AbstractTestContracts


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')
        self.ether_token = self.create_contract('Tokens/EtherToken.sol', libraries={'Math': self.math})
        self.ultimate_oracle_factory = self.create_contract('Oracles/UltimateOracleFactory.sol',
                                                            libraries={'Math': self.math})
        self.centralized_oracle_factory = self.create_contract('Oracles/CentralizedOracleFactory.sol')
        self.ultimate_oracle_abi = self.create_abi('Oracles/UltimateOracle.sol')
        self.centralized_oracle_abi = self.create_abi('Oracles/CentralizedOracle.sol')

    def test(self):
        # Create oracles
        ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        centralized_oracle = self.contract_at(self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash,),
                                              self.centralized_oracle_abi)
        spread_multiplier = 3
        challenge_period = 200  # 200s
        challenge_amount = 100  # 100 Wei
        front_runner_period = 50  # 50s
        ultimate_oracle = self.contract_at(
            self.ultimate_oracle_factory.createUltimateOracle(centralized_oracle.address, self.ether_token.address,
                                                              spread_multiplier, challenge_period, challenge_amount,
                                                              front_runner_period),
            self.ultimate_oracle_abi)
        # Set outcome in central oracle
        centralized_oracle.setOutcome(1)
        self.assertEqual(centralized_oracle.getOutcome(), 1)
        # Set outcome in ultimate oracle
        ultimate_oracle.setForwardedOutcome()
        self.assertEqual(ultimate_oracle.forwardedOutcome(), 1)
        self.assertFalse(ultimate_oracle.isOutcomeSet())
        # Wait for challenge period to pass
        self.s.state.timestamp += challenge_period + 1
        self.assertTrue(ultimate_oracle.isOutcomeSet())
        self.assertEqual(ultimate_oracle.getOutcome(), 1)

