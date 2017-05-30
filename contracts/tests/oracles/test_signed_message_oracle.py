from codecs import encode, decode
from ..abstract_test import AbstractTestContracts, accounts, keys, TransactionFailed
# signing
from bitcoin import ecdsa_raw_sign
from ethereum.utils import sha3


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.signed_message_oracle_factory = self.create_contract('Oracles/SignedMessageOracleFactory.sol')
        self.oracle_abi = self.create_abi('Oracles/SignedMessageOracle.sol')

    @staticmethod
    def i2b(_integer, zfill=64):
        return decode(format(_integer, 'x').zfill(zfill), 'hex')

    def sign_data(self, data, private_key):
        v, r, s = ecdsa_raw_sign(data, private_key)
        return self.i2b(v), self.i2b(r), self.i2b(s)

    def test(self):
        # Create oracles
        description_hash = decode("d621d969951b20c5cf2008cbfc282a2d496ddfe75a76afe7b6b32f1470b8a449", 'hex')
        signer_1 = 0
        signer_2 = 1
        v, r, s = self.sign_data(description_hash, keys[signer_1])
        oracle = self.contract_at(self.signed_message_oracle_factory.createSignedMessageOracle(description_hash, v, r, s),
                                  self.oracle_abi)
        self.assertEqual(oracle.signer(), encode(accounts[signer_1], 'hex'))
        # Replace signer
        nonce = 1
        replace_hash = sha3(
            description_hash +
            accounts[signer_2] +
            self.i2b(nonce)
        )
        # Signing by registered signer works
        v, r, s = self.sign_data(replace_hash, keys[signer_1])
        oracle.replaceSigner(accounts[signer_2], nonce,  v, r, s, sender=keys[signer_1])
        self.assertEqual(oracle.signer(), encode(accounts[signer_2], 'hex'))
        # Set outcome
        outcome = 1
        result_hash = sha3(
            description_hash +
            self.i2b(outcome)
        )
        # Signed by wrong signer fails
        v, r, s = self.sign_data(result_hash, keys[signer_1])
        self.assertRaises(TransactionFailed, oracle.setOutcome, outcome, v, r, s)
        self.assertFalse(oracle.isOutcomeSet())
        # Signing by registered signer works
        v, r, s = self.sign_data(result_hash, keys[signer_2])
        oracle.setOutcome(outcome, v, r, s)
        self.assertTrue(oracle.isOutcomeSet())
        self.assertEqual(oracle.getOutcome(), 1)
