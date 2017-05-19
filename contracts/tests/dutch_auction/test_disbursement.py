from ..abstract_test import AbstractTestContract, accounts, keys


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.dutch_auction.test_disbursement
    """

    PREASSIGNED_TOKENS = 1000000 * 10**18
    WAITING_PERIOD = 60*60*24*7
    ONE_YEAR = 60*60*24*365
    FUNDING_GOAL = 250000 * 10**18
    PRICE_FACTOR = 4000
    FOUR_YEARS = 4 * ONE_YEAR

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)

    def test(self):
        start_date = self.s.block.timestamp
        # Create wallet
        required_accounts = 1
        wa_1 = 1
        constructor_parameters = (
            [accounts[wa_1]],
            required_accounts
        )
        self.multisig_wallet = self.create_contract('Wallets/MultiSigWalletWithDailyLimit.sol',
                                                    params=constructor_parameters)
        # Create disbursement contracts
        self.disbursement_1 = self.create_contract('DutchAuction/Disbursement.sol',
                                                   params=(accounts[0], self.multisig_wallet.address, self.FOUR_YEARS))
        self.disbursement_2 = self.create_contract('DutchAuction/Disbursement.sol',
                                                   params=(accounts[1], self.multisig_wallet.address, self.FOUR_YEARS))
        # Create dutch auction
        self.dutch_auction = self.create_contract('DutchAuction/DutchAuction.sol',
                                                  params=(self.multisig_wallet.address, 250000 * 10 ** 18, 4000))
        # Create Gnosis token
        self.gnosis_token = self.create_contract('Tokens/GnosisToken.sol', params=(self.dutch_auction.address,
                                                                                   [self.disbursement_1.address,
                                                                                    self.disbursement_2.address],
                                                                                   [self.PREASSIGNED_TOKENS / 2,
                                                                                    self.PREASSIGNED_TOKENS / 2]))
        # Setup dutch auction
        self.dutch_auction.setup(self.gnosis_token.address)
        # Setup disbursement contracts
        self.disbursement_1.setup(self.gnosis_token.address)
        self.disbursement_2.setup(self.gnosis_token.address)
        # Set funding goal
        change_ceiling_data = self.dutch_auction.translator.encode('changeSettings',
                                                                   [self.FUNDING_GOAL, self.PRICE_FACTOR])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, change_ceiling_data, sender=keys[wa_1])
        # Start auction
        start_auction_data = self.dutch_auction.translator.encode('startAuction', [])
        self.multisig_wallet.submitTransaction(self.dutch_auction.address, 0, start_auction_data, sender=keys[wa_1])
        # End auction
        value = self.FUNDING_GOAL * 10 ** 18
        spender = 9
        self.s.block.set_balance(accounts[spender], value * 2)
        self.dutch_auction.bid(accounts[spender], sender=keys[spender], value=value)
        # We wait for one week
        self.s.block.timestamp += self.WAITING_PERIOD + 1
        # Token is launched
        self.assertEqual(self.dutch_auction.updateStage(), 4)
        # Test disbursement
        self.assertEqual(self.gnosis_token.balanceOf(self.disbursement_1.address), self.PREASSIGNED_TOKENS/2)
        self.assertEqual(self.gnosis_token.balanceOf(self.disbursement_2.address), self.PREASSIGNED_TOKENS/2)
        # After one year, 1/4 of shares can be withdrawn
        self.s.block.timestamp = start_date + self.ONE_YEAR
        self.assertEqual(self.disbursement_1.calcMaxWithdraw(), self.PREASSIGNED_TOKENS/2/4)
        self.assertEqual(self.disbursement_2.calcMaxWithdraw(), self.PREASSIGNED_TOKENS/2/4)
        # After two years, 1/2 of shares can be withdrawn
        self.s.block.timestamp += self.ONE_YEAR
        self.assertEqual(self.disbursement_1.calcMaxWithdraw(), self.PREASSIGNED_TOKENS/2/2)
        self.assertEqual(self.disbursement_2.calcMaxWithdraw(), self.PREASSIGNED_TOKENS/2/2)
        # Owner withdraws shares
        self.disbursement_1.withdraw(accounts[8], self.disbursement_1.calcMaxWithdraw())
        self.assertEqual(self.disbursement_1.calcMaxWithdraw(), 0)
        self.assertEqual(self.gnosis_token.balanceOf(self.disbursement_1.address), self.PREASSIGNED_TOKENS/4)
        # Wallet withdraws remaining tokens
        wallet_withdraw_data = self.disbursement_1.translator.encode('walletWithdraw', [])
        old_balance = self.gnosis_token.balanceOf(self.multisig_wallet.address)
        old_disbursement_balance = self.gnosis_token.balanceOf(self.disbursement_1.address)
        self.multisig_wallet.submitTransaction(self.disbursement_1.address, 0, wallet_withdraw_data, sender=keys[wa_1])
        self.assertEqual(self.disbursement_1.calcMaxWithdraw(), 0)
        self.assertEqual(self.gnosis_token.balanceOf(self.disbursement_1.address), 0)
        self.assertEqual(self.gnosis_token.balanceOf(self.multisig_wallet.address), old_balance + old_disbursement_balance)
