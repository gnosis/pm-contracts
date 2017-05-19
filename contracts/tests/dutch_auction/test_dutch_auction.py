from ..abstract_test import AbstractTestContract, accounts, keys, TransactionFailed


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.dutch_auction.test_dutch_auction
    """

    BLOCKS_PER_DAY = 5760
    TOTAL_TOKENS = 10000000 * 10**18
    MAX_TOKENS_SOLD = 9000000
    PREASSIGNED_TOKENS = 1000000 * 10**18
    WAITING_PERIOD = 60*60*24*7
    FUNDING_GOAL = 250000 * 10**18
    PRICE_FACTOR = 4000
    MAX_GAS = 150000  # Kraken gas limit

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
        # Change funding goal
        self.assertEqual(self.dutch_auction.ceiling(), self.FUNDING_GOAL)
        self.assertEqual(self.dutch_auction.priceFactor(), self.PRICE_FACTOR)
        self.FUNDING_GOAL = 260000 * 10**18
        self.PRICE_FACTOR = 5000
        change_ceiling_data = self.dutch_auction.translator.encode('changeSettings',
                                                                   [self.FUNDING_GOAL, self.PRICE_FACTOR])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, change_ceiling_data, sender=keys[wa_1])
        self.assertEqual(self.dutch_auction.ceiling(), self.FUNDING_GOAL)
        self.assertEqual(self.dutch_auction.priceFactor(), self.PRICE_FACTOR)
        # Start auction
        start_auction_data = self.dutch_auction.translator.encode('startAuction', [])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, start_auction_data, sender=keys[wa_1])
        # After auction started, funding goal cannot be changed anymore
        change_ceiling_data = self.dutch_auction.translator.encode('changeSettings', [1])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, change_ceiling_data, sender=keys[wa_1])
        self.assertEqual(self.dutch_auction.ceiling(), self.FUNDING_GOAL)
        # Setups cannot be done twice
        self.assertRaises(TransactionFailed, self.dutch_auction.setup, self.gnosis_token.address)
        # Bidder 1 places a bid in the first block after auction starts
        self.assertEqual(self.dutch_auction.calcTokenPrice(), self.PRICE_FACTOR * 10 ** 18 / 7500 + 1)
        bidder_1 = 0
        value_1 = 100000 * 10**18  # 100k Ether
        self.s.block.set_balance(accounts[bidder_1], value_1*2)
        profiling = self.dutch_auction.bid(sender=keys[bidder_1], value=value_1, profiling=True)
        self.assertLessEqual(profiling['gas'], self.MAX_GAS)
        self.assertEqual(self.dutch_auction.calcStopPrice(), value_1 / self.MAX_TOKENS_SOLD + 1)
        # A few blocks later
        self.s.block.number += self.BLOCKS_PER_DAY*2
        self.assertEqual(self.dutch_auction.calcTokenPrice(),
                         self.PRICE_FACTOR * 10 ** 18 / (self.BLOCKS_PER_DAY * 2 + 7500) + 1)
        # Stop price didn't change
        self.assertEqual(self.dutch_auction.calcStopPrice(), value_1 / self.MAX_TOKENS_SOLD + 1)
        # Spender places a bid in the name of bidder 2
        bidder_2 = 1
        spender = 9
        value_2 = 100000 * 10**18  # 100k Ether
        self.s.block.set_balance(accounts[spender], value_2*2)
        # Spender accidentally defines dutch auction contract as receiver
        self.assertRaises(
            TransactionFailed, self.dutch_auction.bid, self.dutch_auction.address, sender=keys[spender], value=value_2)
        # Spender accidentally defines token contract as receiver
        self.assertRaises(
            TransactionFailed, self.dutch_auction.bid, self.gnosis_token.address, sender=keys[spender], value=value_2)
        self.dutch_auction.bid(accounts[bidder_2], sender=keys[spender], value=value_2)
        # Stop price changed
        self.assertEqual(self.dutch_auction.calcStopPrice(), (value_1 + value_2) / self.MAX_TOKENS_SOLD + 1)
        # A few blocks later
        self.s.block.number += self.BLOCKS_PER_DAY*3
        self.assertEqual(self.dutch_auction.calcTokenPrice(),
                         self.PRICE_FACTOR * 10 ** 18 / (self.BLOCKS_PER_DAY * 5 + 7500) + 1)
        self.assertEqual(self.dutch_auction.calcStopPrice(), (value_1 + value_2) / self.MAX_TOKENS_SOLD + 1)
        # Bidder 3 places a bid
        bidder_3 = 2
        value_3 = 100000 * 10 ** 18  # 100k Ether
        self.s.block.set_balance(accounts[bidder_3], value_3*2)
        profiling = self.dutch_auction.bid(sender=keys[bidder_3], value=value_3, profiling=True)
        self.assertLessEqual(profiling['gas'], self.MAX_GAS)
        refund_bidder_3 = (value_1 + value_2 + value_3) - self.FUNDING_GOAL
        # Bidder 3 gets refund; but paid gas so balance isn't exactly 0.75M Ether
        self.assertGreater(self.s.block.get_balance(accounts[bidder_3]), 0.98 * (value_3 + refund_bidder_3))
        self.assertEqual(self.dutch_auction.calcStopPrice(),
                         (value_1 + value_2 + (value_3 - refund_bidder_3)) / self.MAX_TOKENS_SOLD + 1)
        # Auction is over, no more bids are accepted
        self.assertRaises(TransactionFailed, self.dutch_auction.bid, sender=keys[bidder_3], value=value_3)
        self.assertEqual(self.dutch_auction.finalPrice(), self.dutch_auction.calcTokenPrice())
        # There is no money left in the contract
        self.assertEqual(self.s.block.get_balance(self.dutch_auction.address), 0)
        # Auction ended but trading is not possible yet, because there is one week pause after auction ends
        # We wait for one week
        self.s.block.timestamp += self.WAITING_PERIOD
        self.assertRaises(TransactionFailed,
                          self.dutch_auction.claimTokens,
                          sender=keys[bidder_1])
        # Go past one week
        self.s.block.timestamp += 1
        # Bidder 1 claim his tokens after the waiting period is over
        self.dutch_auction.claimTokens(sender=keys[bidder_1])
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_1]),
                         value_1 * 10 ** 18 / self.dutch_auction.finalPrice())
        # Spender is triggering the claiming process for bidder 2
        self.dutch_auction.claimTokens(accounts[bidder_2], sender=keys[spender])
        # Bidder 3 claims his tokens
        self.dutch_auction.claimTokens(sender=keys[bidder_3])
        # Confirm token balances
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_2]),
                         value_2 * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_3]),
                         (value_3 - refund_bidder_3) * 10 ** 18 / self.dutch_auction.finalPrice())
        self.assertEqual(self.gnosis_token.balanceOf(self.multisig_wallet.address),
                         self.PREASSIGNED_TOKENS + (
                             self.MAX_TOKENS_SOLD * 10 ** 18 - self.dutch_auction.totalReceived() * 10 ** 18
                             / self.dutch_auction.finalPrice()))
        self.assertEqual(self.gnosis_token.totalSupply(), self.TOTAL_TOKENS)
        self.assertEqual(self.dutch_auction.totalReceived(), self.FUNDING_GOAL)
        # Token is launched
        self.assertEqual(self.dutch_auction.stage(), 4)
        # Shares can be traded now. Backer 3 transfers 1000 shares to backer 4.
        transfer_shares = 1000
        bidder_4 = 3
        self.assertTrue(self.gnosis_token.transfer(accounts[bidder_4], transfer_shares, sender=keys[bidder_3]))
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_4]), transfer_shares)
        # Also transferFrom works now.
        self.assertTrue(self.gnosis_token.approve(accounts[bidder_3], transfer_shares, sender=keys[bidder_4]))
        self.assertTrue(
            self.gnosis_token.transferFrom(accounts[bidder_4],
                                           accounts[bidder_3],
                                           transfer_shares,
                                           sender=keys[bidder_3]))
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_4]), 0)
