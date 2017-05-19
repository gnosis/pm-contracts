from ..abstract_test import AbstractTestContract, accounts, keys, TransactionFailed


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.do.test_stop_price_equal_token_price

    Stop price is equal to token price after calcTokenPrice * TOTAL_TOKENS_SOLD was invested.
    After this No bids ar accepted anymore and auction ends.
    """

    BACKER_1 = 1
    BACKER_2 = 2
    BLOCKS_PER_DAY = 5760
    TOTAL_TOKENS = 10000000 * 10**18
    TOTAL_TOKENS_SOLD = 9000000
    PREASSIGNED_TOKENS = 1000000 * 10**18
    FUNDING_GOAL = 250000 * 10**18
    START_PRICE_FACTOR = 4000
    MAX_TOKENS_SOLD = 9000000
    WAITING_PERIOD = 60*60*24*7

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
        # Set funding goal
        change_ceiling_data = self.dutch_auction.translator.encode('changeSettings',
                                                                   [self.FUNDING_GOAL, self.START_PRICE_FACTOR])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, change_ceiling_data, sender=keys[wa_1])
        # Start auction
        start_auction_data = self.dutch_auction.translator.encode('startAuction', [])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, start_auction_data, sender=keys[wa_1])
        # 60 days later
        days_later = self.BLOCKS_PER_DAY*60
        self.s.block.number += days_later
        # Bidder 1 places a bid in the first block after auction starts
        bidder_1 = 0
        value_1 = self.dutch_auction.calcTokenPrice() * self.TOTAL_TOKENS_SOLD - self.TOTAL_TOKENS_SOLD
        self.s.block.set_balance(accounts[bidder_1], value_1 * 2)
        self.dutch_auction.bid(sender=keys[bidder_1], value=value_1)
        self.assertEqual(self.dutch_auction.calcTokenPrice(),
                         self.START_PRICE_FACTOR * 10 ** 18 / (7500 + days_later) + 1)
        self.assertEqual(self.dutch_auction.calcStopPrice(), value_1 / self.MAX_TOKENS_SOLD + 1)
        self.assertEqual(self.dutch_auction.calcTokenPrice(), self.dutch_auction.calcStopPrice())
        # Bidder 2 places a bid but fails because stop price was reached already
        bidder_2 = 1
        self.assertRaises(TransactionFailed, self.dutch_auction.bid, sender=keys[bidder_2], value=1)
        # There is no money left in the contract
        self.assertEqual(self.s.block.get_balance(self.dutch_auction.address), 0)
        # Token is not launched yet, as a week cool-down period still has to pass
        self.assertEqual(self.dutch_auction.updateStage(), 3)
        # We wait for one week, token is launched now
        self.s.block.timestamp += self.WAITING_PERIOD + 1
        self.assertEqual(self.dutch_auction.updateStage(), 4)
        # Everyone gets their tokens
        self.dutch_auction.claimTokens(sender=keys[bidder_1])
        # Confirm token balances
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_1]),
                         value_1 * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(
            self.gnosis_token.balanceOf(self.multisig_wallet.address),
            self.TOTAL_TOKENS - self.dutch_auction.totalReceived() * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(self.gnosis_token.totalSupply(), self.TOTAL_TOKENS)
        # All funds went to the multisig wallet
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), value_1)
