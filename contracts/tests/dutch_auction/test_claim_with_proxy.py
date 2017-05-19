from ..abstract_test import AbstractTestContract, accounts, keys


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.dutch_auction.test_claim_with_proxy
    """

    BLOCKS_PER_DAY = 5760
    MAX_TOKENS_SOLD = 9000000 * 10**18
    PREASSIGNED_TOKENS = 1000000 * 10**18
    WAITING_PERIOD = 60*60*24*7
    FUNDING_GOAL = 250000 * 10**18
    PRICE_FACTOR = 4000

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)

    def test(self):
        # Create wallet
        required_accounts = 1
        wa_1 = 1
        constructor_parameters = (
            [accounts[wa_1]],
            required_accounts
        )
        self.multisig_wallet = self.create_contract('Wallets/MultiSigWalletWithDailyLimit.sol',
                                                    params=constructor_parameters)
        # Create dutch auction
        self.dutch_auction = self.create_contract('DutchAuction/DutchAuction.sol',
                                                  params=(self.multisig_wallet.address, 250000 * 10 ** 18, 4000))
        # Create Gnosis token
        self.gnosis_token = self.create_contract('Tokens/GnosisToken.sol', params=(self.dutch_auction.address,
                                                                                   [self.multisig_wallet.address],
                                                                                   [self.PREASSIGNED_TOKENS]))
        # Setup dutch auction
        self.dutch_auction.setup(self.gnosis_token.address)
        # Create claim proxy
        self.claim_proxy = self.create_contract('DutchAuction/ClaimProxy.sol', params=(self.dutch_auction.address, ))
        # Set funding goal
        change_ceiling_data = self.dutch_auction.translator.encode('changeSettings',
                                                                   [self.FUNDING_GOAL, self.PRICE_FACTOR])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, change_ceiling_data, sender=keys[wa_1])
        # Start auction
        start_auction_data = self.dutch_auction.translator.encode('startAuction', [])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, start_auction_data, sender=keys[wa_1])
        # Bidder 1 places a bid in the first block after auction starts
        bidder_1 = 0
        value_1 = 100000 * 10**18  # 100k Ether
        self.s.block.set_balance(accounts[bidder_1], value_1*2)
        self.dutch_auction.bid(sender=keys[bidder_1], value=value_1)
        # A few blocks later
        self.s.block.number += self.BLOCKS_PER_DAY*2
        # Spender places a bid in the name of bidder 2
        bidder_2 = 1
        spender = 9
        value_2 = 100000 * 10**18  # 100k Ether
        self.s.block.set_balance(accounts[spender], value_2*2)
        self.dutch_auction.bid(accounts[bidder_2], sender=keys[spender], value=value_2)
        # A few blocks later
        self.s.block.number += self.BLOCKS_PER_DAY*3
        # Bidder 3 places a bid
        bidder_3 = 2
        value_3 = 100000 * 10 ** 18  # 100k Ether
        self.s.block.set_balance(accounts[bidder_3], value_3*2)
        profiling = self.dutch_auction.bid(sender=keys[bidder_3], value=value_3, profiling=True)
        refund_bidder_3 = (value_1 + value_2 + value_3) - self.FUNDING_GOAL
        # We wait for one week
        self.s.block.timestamp += self.WAITING_PERIOD + 1
        # Claim all tokens via proxy
        self.claim_proxy.claimTokensFor([accounts[bidder_1], accounts[bidder_2], accounts[bidder_3]])
        # Confirm token balances
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_2]),
                         value_2 * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_3]),
                         (value_3 - refund_bidder_3) * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(self.gnosis_token.balanceOf(self.multisig_wallet.address),
                         self.PREASSIGNED_TOKENS + (
                             self.MAX_TOKENS_SOLD - self.dutch_auction.totalReceived() * 10 ** 18
                             / self.dutch_auction.finalPrice()))
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_1]),
                         value_1 * 10 ** 18 / self.dutch_auction.finalPrice())
