from ..abstract_test import AbstractTestContract, accounts, keys, TransactionFailed


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.dutch_auction.test_dutch_auction_stop_price
    """

    BLOCKS_PER_DAY = 5760
    TOTAL_TOKENS = 10000000 * 10**18
    WAITING_PERIOD = 60*60*24*7
    PREASSIGNED_TOKENS = 1000000 * 10**18
    FUNDING_GOAL = 250000 * 10**18
    PRICE_FACTOR = 4000
    MAX_TOKENS_SOLD = 9000000

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)

    def test(self):
        # Create mist wallet
        required_accounts = 1
        wa_1 = 1
        # Create wallet
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
                                                                   [self.FUNDING_GOAL, self.PRICE_FACTOR])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, change_ceiling_data, sender=keys[wa_1])
        # Start auction
        start_auction_data = self.dutch_auction.translator.encode('startAuction', [])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, start_auction_data, sender=keys[wa_1])
        # Token is not launched yet
        self.assertEqual(self.dutch_auction.stage(), 2)
        # Bidder 1 places a bid in the first block after auction starts
        self.assertEqual(self.dutch_auction.calcTokenPrice(), self.PRICE_FACTOR * 10 ** 18 / 7500 + 1)
        bidder_1 = 0
        value_1 = 100000 * 10**18  # 100k Ether
        self.s.block.set_balance(accounts[bidder_1], value_1*2)
        self.dutch_auction.bid(sender=keys[bidder_1], value=value_1)
        self.assertEqual(self.dutch_auction.calcStopPrice(), value_1 / self.MAX_TOKENS_SOLD + 1)
        # A few blocks later
        self.s.block.number += self.BLOCKS_PER_DAY*2
        self.assertEqual(self.dutch_auction.calcTokenPrice(),
                         self.PRICE_FACTOR * 10 ** 18 / (self.BLOCKS_PER_DAY * 2 + 7500) + 1)
        # Bidder 2 places a bid
        bidder_2 = 1
        value_2 = 100000 * 10**18  # 100k Ether
        self.s.block.set_balance(accounts[bidder_2], value_2*2)
        self.dutch_auction.bid(sender=keys[bidder_2], value=value_2)
        # Stop price changed
        self.assertEqual(self.dutch_auction.calcStopPrice(), (value_1 + value_2) / self.MAX_TOKENS_SOLD + 1)
        # Stop price is reached
        self.s.block.number += self.BLOCKS_PER_DAY*40
        # Auction is over, no more bids are accepted
        self.s.block.set_balance(accounts[bidder_2], value_2 * 2)
        self.assertRaises(TransactionFailed, self.dutch_auction.bid, sender=keys[bidder_2], value=value_2)
        self.assertLess(self.dutch_auction.calcTokenPrice(), self.dutch_auction.calcStopPrice())
        # There is no money left in the contract
        self.assertEqual(self.s.block.get_balance(self.dutch_auction.address), 0)
        # Update stage after stop price is reached
        self.dutch_auction.updateStage()
        # Token is not launched yet, as a week cool-down period still has to pass
        self.assertEqual(self.dutch_auction.stage(), 3)
        # We wait for one week, token is launched now
        self.s.block.timestamp += self.WAITING_PERIOD + 1
        self.dutch_auction.updateStage()
        self.assertEqual(self.dutch_auction.stage(), 4)
        # Everyone gets their tokens
        self.dutch_auction.claimTokens(sender=keys[bidder_1])
        self.dutch_auction.claimTokens(sender=keys[bidder_2])
        # Confirm token balances
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_1]),
                         value_1 * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_2]),
                         value_2 * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(
            self.gnosis_token.balanceOf(self.multisig_wallet.address),
            self.TOTAL_TOKENS - self.dutch_auction.totalReceived() * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(self.gnosis_token.totalSupply(), self.TOTAL_TOKENS)
        # All funds went to the multisig wallet
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), value_1 + value_2)

