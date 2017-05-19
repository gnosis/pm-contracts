# contracts package
from contracts import ROOT_DIR
# ethereum pacakge
from ethereum import tester as t
from ethereum.tester import keys, accounts, TransactionFailed, ABIContract
from ethereum import _solidity
from ethereum.abi import ContractTranslator
# standard libraries
from codecs import encode, decode
from unittest import TestCase
from os import walk
import string


class AbstractTestContract(TestCase):
    """
    run all tests with python -m unittest discover contracts.tests
    """

    HOMESTEAD_BLOCK = 1150000
    CONTRACT_DIR = 'solidity'

    def __init__(self, *args, **kwargs):
        super(AbstractTestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.solidity = _solidity.solc_wrapper()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388

    @staticmethod
    def is_hex(s):
        return all(c in string.hexdigits for c in s)

    def get_dirs(self, path):
        abs_contract_path = '{}/{}'.format(ROOT_DIR, self.CONTRACT_DIR)
        sub_dirs = [x[0] for x in walk(abs_contract_path)]
        extra_args = ' '.join(['{}={}'.format(d.split('/')[-1], d) for d in sub_dirs])
        path = '{}/{}'.format(abs_contract_path, path)
        return path, extra_args

    def contract_at(self, abi, address):
        return ABIContract(self.s, address, abi)

    def create_abi(self, path, libraries=None):
        path, extra_args = self.get_dirs(path)
        if libraries:
            for name, address in libraries.items():
                if type(address) == str:
                    if self.is_hex(address):
                        libraries[name] = address
                    else:
                        libraries[name] = encode(address, 'hex')
                elif isinstance(address, t.ABIContract):
                    libraries[name] = encode(address.address, 'hex')
                else:
                    raise ValueError
        return ContractTranslator(self.solidity.mk_full_signature(None, path=path, libraries=libraries, extra_args=extra_args))

    def create_contract(self, path, params=None, libraries=None, sender=None):
        path, extra_args = self.get_dirs(path)
        if params:
            params = [x.address if isinstance(x, t.ABIContract) else x for x in params]
        if libraries:
            for name, address in libraries.items():
                if type(address) == str:
                    if self.is_hex(address):
                        libraries[name] = address
                    else:
                        libraries[name] = encode(address, 'hex')
                elif isinstance(address, t.ABIContract):
                    libraries[name] = encode(address.address, 'hex')
                else:
                    raise ValueError
        return self.s.abi_contract(None,
                                   path=path,
                                   constructor_parameters=params,
                                   libraries=libraries,
                                   language='solidity',
                                   extra_args=extra_args,
                                   sender=keys[sender if sender else 0])
