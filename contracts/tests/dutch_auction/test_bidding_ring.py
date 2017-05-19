from ..abstract_test import AbstractTestContract, accounts, keys, TransactionFailed


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.dutch_auction.test_bidding_ring
    """

    PREASSIGNED_TOKENS = 1000000 * 10**18
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
        # Create proxy sender
        max_price = 533262231702439675
        self.bidding_ring = self.create_contract('DutchAuction/BiddingRing.sol',
                                                 params=(self.dutch_auction.address, max_price))
        # Collect bids
        bidder_1 = 1
        value_1 = 100000 * 10 ** 18  # 100k Ether
        self.s.send(keys[bidder_1], self.bidding_ring.address, value_1)
        bidder_2 = 2
        value_2 = 120000 * 10 ** 18  # 120k Ether
        self.s.send(keys[bidder_2], self.bidding_ring.address, value_2)
        bidder_3 = 3
        value_3 = 100000 * 10 ** 18  # 100k Ether
        self.bidding_ring.contribute(sender=keys[bidder_3], value=value_3)
        self.assertEqual(self.bidding_ring.contributions(accounts[bidder_3]), value_3)
        # Bidder 3 wants a refund
        self.bidding_ring.refund(sender=keys[bidder_3])
        self.assertEqual(self.bidding_ring.contributions(accounts[bidder_3]), 0)
        # Bidder 3 changes his mind
        self.bidding_ring.contribute(sender=keys[bidder_3], value=value_3)
        self.assertEqual(self.bidding_ring.contributions(accounts[bidder_3]), value_3)
        # Bid proxy will fail before auction starts
        self.assertRaises(TransactionFailed, self.bidding_ring.bidProxy)
        # Start auction
        start_auction_data = self.dutch_auction.translator.encode('startAuction', [])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, start_auction_data, sender=keys[wa_1])
        # Bid proxy works now
        self.assertEqual(self.s.block.get_balance(self.bidding_ring.address), value_1 + value_2 + value_3)
        # Price was not reached yet, transaction fails
        self.assertRaises(TransactionFailed, self.bidding_ring.bidProxy)
        self.s.mine()
        # Price was reached, transaction works
        self.bidding_ring.bidProxy()
        self.assertEqual(self.s.block.get_balance(self.bidding_ring.address),
                         value_1 + value_2 + value_3 - 250000 * 10**18)
        # After proxy bid was sent, no new contributions can be made
        self.assertRaises(TransactionFailed, self.s.send, keys[bidder_1], self.bidding_ring.address, value_1)
        # Bid proxy works only once
        self.assertRaises(TransactionFailed, self.bidding_ring.bidProxy)
        # Auction is over, no more bids are accepted
        # There is no money left in the contract
        self.assertEqual(self.s.block.get_balance(self.dutch_auction.address), 0)
        # Auction ended but trading is not possible yet, because there is one week pause after auction ends
        self.assertRaises(TransactionFailed, self.bidding_ring.claimProxy)
        # We wait for one week
        self.s.block.timestamp += self.WAITING_PERIOD
        self.assertRaises(TransactionFailed,
                          self.dutch_auction.claimTokens,
                          sender=keys[bidder_1])
        # Go past one week
        self.s.block.timestamp += 1
        self.dutch_auction.updateStage()
        # Claiming is possible now
        self.bidding_ring.claimProxy()
        # But only once
        self.assertRaises(TransactionFailed, self.bidding_ring.claimProxy)
        # Transfer claimed tokens
        total_tokens = self.gnosis_token.balanceOf(self.bidding_ring.address)
        total_refund = self.s.block.get_balance(self.gnosis_token.address)
        self.bidding_ring.transferTokens(sender=keys[bidder_1])
        self.bidding_ring.transferRefunds(sender=keys[bidder_1])
        self.assertEqual(self.gnosis_token.balanceOf(self.bidding_ring.address),
                         total_tokens - (total_tokens * 10 / 32))
        self.assertEqual(self.s.block.get_balance(self.gnosis_token.address),
                         total_refund - (total_refund * 10 / 32))
        # Tokens have to be transferred first
        self.assertRaises(TransactionFailed, self.bidding_ring.transferRefunds, sender=keys[bidder_2])
        self.s.send(keys[bidder_2], self.bidding_ring.address, 0)
        self.bidding_ring.transferRefunds(sender=keys[bidder_1])
        self.assertEqual(self.gnosis_token.balanceOf(self.bidding_ring.address),
                         total_tokens - (total_tokens * 10 / 32) - (total_tokens * 12 / 32))
        self.assertEqual(self.s.block.get_balance(self.gnosis_token.address),
                         total_refund - (total_refund * 10 / 32) - (total_refund * 12 / 32))
        # Confirm token balances
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_1]), (total_tokens * 10 / 32))
        self.assertEqual(self.gnosis_token.balanceOf(accounts[bidder_2]), (total_tokens * 12 / 32))
