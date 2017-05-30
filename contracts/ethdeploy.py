from codecs import encode, decode
from ethjsonrpc import EthJsonRpc
from ethereum.abi import ContractTranslator
from ethereum.transactions import Transaction
from ethereum.utils import privtoaddr
from ethereum import _solidity
import click
import time
import json
import rlp
import logging
import os


# create logger
logger = logging.getLogger('DEPLOY')
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


class EthDeploy:

    def __init__(self, protocol, host, port, gas, gas_price, contract_dir, optimize, account, private_key_path):
        # establish rpc connection
        self.json_rpc = EthJsonRpc(protocol=protocol, host=host, port=port)
        self._from = None
        self.private_key = None
        # set sending account
        if account:
            self._from = self.add_0x(account)
        elif private_key_path:
            with open(private_key_path, 'r') as private_key_file:
                self.private_key = private_key_file.read().strip()
            self._from = self.add_0x(encode(privtoaddr(decode(self.private_key, 'hex')),'hex'))
        else:
            accounts = self.json_rpc.eth_accounts()['result']
            if len(accounts) == 0:
                raise ValueError('No account unlocked')
            self._from = self.add_0x(accounts[0])
        # account address in right format
        if not self.is_address(self._from):
            raise ValueError('Account address is wrong')
        self.optimize = optimize
        self.contract_dir = contract_dir
        self.gas = gas
        self.gas_price = gas_price
        # references dict maps labels to addresses
        self.references = {}
        # abis dict maps addresses to abis
        self.abis = {}
        # total consumed gas
        self.total_gas = 0
        self.log('Instructions are sent from address: {}'.format(self._from))
        balance = self.hex2int(self.json_rpc.eth_getBalance(self._from)['result'])
        self.log('Address balance: {} Ether / {} Wei'.format(balance/10.0**18, balance))

    def is_address(self, string):
        return len(self.add_0x(string)) == 42

    @staticmethod
    def hex2int(_hex):
        return int(_hex, 16)

    @staticmethod
    def add_0x(string):
        if not string.startswith('0x'):
            return '0x' + string
        return string

    @staticmethod
    def strip_0x(string):
        if string.startswith('0x'):
            return string[2:]
        return string

    @staticmethod
    def log(string):
        logger.info(string)

    def format_reference(self, string):
        return self.add_0x(string) if self.is_address(string) else string

    def log_transaction_receipt(self, transaction_receipt):
        gas_used = self.hex2int(transaction_receipt['gasUsed'])
        self.total_gas += gas_used
        self.log('Transaction receipt: {} block number, {} gas used, {} cumulative gas used'.format(
            self.hex2int(transaction_receipt['blockNumber']),
            gas_used,
            self.hex2int(transaction_receipt['cumulativeGasUsed'])
        ))

    def get_transaction_receipt(self, transaction_hash):
        return self.json_rpc.eth_getTransactionReceipt(transaction_hash)['result']

    def wait_for_transaction_receipt(self, transaction_hash):
        while self.get_transaction_receipt(transaction_hash) is None:
            self.log('Waiting for transaction receipt {}'.format(transaction_hash))
            time.sleep(5)
        return self.get_transaction_receipt(transaction_hash)

    def replace_references(self, a):
        if isinstance(a, list):
            return [self.replace_references(i) for i in a]
        else:
            return self.references[a] if isinstance(a, basestring) and a in self.references else a

    def get_nonce(self):
        transaction_count = self.json_rpc.eth_getTransactionCount(self._from, default_block='pending')['result']
        return self.hex2int(self.strip_0x(transaction_count))

    def get_raw_transaction(self, to='', value=0, data=''):
        nonce = self.get_nonce()
        tx = Transaction(nonce, self.gas_price, self.gas, to, value, decode(data, 'hex'))
        tx.sign(decode(self.private_key, 'hex'))
        return self.add_0x(encode(rlp.encode(tx), 'hex'))

    def compile_code(self, path):
        # create list of valid paths
        absolute_path = self.contract_dir if self.contract_dir.startswith('/') else '{}/{}'.format(os.getcwd(),
                                                                                                   self.contract_dir)
        sub_dirs = [x[0] for x in os.walk(absolute_path)]
        extra_args = ' '.join(['{}={}'.format(d.split('/')[-1], d) for d in sub_dirs])
        # compile code
        combined = _solidity.compile_last_contract(path, libraries=self.references, combined='bin,abi',
                                                   optimize=self.optimize, extra_args=extra_args)
        bytecode = combined['bin_hex']
        abi = combined['abi']
        return bytecode, abi

    def deploy(self, _from, file_path, libraries, value, params, label):
        # replace library placeholders
        if libraries:
            for library_name, library_address in libraries.items():
                self.references[library_name] = self.replace_references(self.strip_0x(library_address))
        if self.contract_dir:
            file_path = '{}/{}'.format(self.contract_dir, file_path)
        bytecode, abi = self.compile_code(file_path)
        if not label:
            label = file_path.split("/")[-1].split(".")[0]
        if params:
            translator = ContractTranslator(abi)
            # replace constructor placeholders
            params = [self.replace_references(p) for p in params]
            bytecode += encode(translator.encode_constructor_arguments(params), 'hex')
        # deploy contract
        self.log('Deployment transaction for {} sent'.format(label if label else 'unknown'))
        tx_response = None
        if self.private_key:
            raw_tx = self.get_raw_transaction(value=value, data=bytecode)
            while tx_response is None or 'error' in tx_response:
                if tx_response and 'error' in tx_response:
                    self.log('Deploy failed with error {}'.format(tx_response['error']['message']))
                    time.sleep(5)
                tx_response = self.json_rpc.eth_sendRawTransaction(raw_tx)
        else:
            while tx_response is None or 'error' in tx_response:
                if tx_response and 'error' in tx_response:
                    self.log('Deploy failed with error {}'.format(tx_response['error']['message']))
                    time.sleep(5)
                tx_response = self.json_rpc.eth_sendTransaction(self.add_0x(_from if _from else self._from),
                                                                value=value,
                                                                data=self.add_0x(bytecode),
                                                                gas=self.gas,
                                                                gas_price=self.gas_price)
        transaction_receipt = self.wait_for_transaction_receipt(self.add_0x(tx_response['result']))
        contract_address = self.strip_0x(transaction_receipt['contractAddress'])
        self.references[label] = contract_address
        self.abis[contract_address] = abi
        self.log('Contract {} created at address {}'.format(label if label else 'unknown',
                                                            self.add_0x(contract_address)))
        self.log_transaction_receipt(transaction_receipt)

    def send_transaction(self, _from, to, value, name, params, abi):
        reference = to
        to = self.replace_references(to)
        data = ''
        if name or abi:
            if not name:
                name = abi['name']
            abi = self.abis[to] if to in self.abis else [abi]
            translator = ContractTranslator(abi)
            data = encode(translator.encode(name, self.replace_references(params)), "hex")
        self.log('Transaction to {}{} sent'.format(self.format_reference(reference),
                                                   ' calling {} function'.format(name) if name else ''))
        tx_response = None
        if self.private_key:
            raw_tx = self.get_raw_transaction(to=to, value=value, data=data)
            while tx_response is None or 'error' in tx_response:
                if tx_response and 'error' in tx_response:
                    self.log('Transaction failed with error {}'.format(tx_response['error']['message']))
                    time.sleep(5)
                tx_response = self.json_rpc.eth_sendRawTransaction(raw_tx)
        else:
            while tx_response is None or 'error' in tx_response:
                if tx_response and 'error' in tx_response:
                    self.log('Transaction failed with error {}'.format(tx_response['error']['message']))
                    time.sleep(5)
                tx_response = self.json_rpc.eth_sendTransaction(self.add_0x(_from if _from else self._from),
                                                                to_address=self.add_0x(to),
                                                                value=value,
                                                                data=self.add_0x(data),
                                                                gas=self.gas,
                                                                gas_price=self.gas_price)
        transaction_hash = tx_response['result']
        transaction_receipt = self.wait_for_transaction_receipt(self.add_0x(transaction_hash))
        self.log('Transaction to {}{} successful'.format(self.format_reference(reference),
                                                         ' calling {} function'.format(name) if name else ''))
        self.log_transaction_receipt(transaction_receipt)

    def call(self, _from, to, value, name, params, label, assertion, abi):
        reference = to
        to = self.replace_references(to)
        if not name:
            name = abi['name']
        abi = self.abis[to] if to in self.abis else [abi]
        translator = ContractTranslator(abi)
        data = encode(translator.encode(name, self.replace_references(params)), 'hex')
        response = self.json_rpc.eth_call(
            self.add_0x(to),
            from_address=self.add_0x(_from if _from else self._from),
            value=value,
            data=self.add_0x(data),
            gas=self.gas,
            gas_price=self.gas_price
        )
        result = translator.decode(name, decode(self.strip_0x(response['result']), 'hex'))
        result = result if len(result) > 1 else result[0]
        if label:
            self.references[label] = result
        if assertion:
            expected_result = self.replace_references(assertion)
            if isinstance(expected_result, int) or isinstance(expected_result, long):
                assert result == expected_result
            else:
                assert result.lower() == self.strip_0x(expected_result.lower())
            self.log('Assertion of {} at {} successful'.format(name, self.format_reference(reference)))
        else:
            self.log('Call to {} calling function {} successful'.format(self.format_reference(reference), name))

    def process(self, f):
        # read instructions file
        with open(f, 'r') as instructions_file:
            instructions = json.load(instructions_file)
        for i in instructions:
            if i['type'] == 'abi':
                for address in i['addresses']:
                    self.abis[self.strip_0x(address)] = i['abi']
            if i['type'] == 'deployment':
                self.deploy(
                    i['from'] if 'from' in i else None,
                    i['file'] if 'file' in i else None,
                    i['libraries'] if 'libraries' in i else None,
                    i['value'] if 'value' in i else 0,
                    i['params'] if 'params' in i else (),
                    i['label'] if 'label' in i else None
                )
            elif i["type"] == "transaction":
                self.send_transaction(
                    i['from'] if 'from' in i else None,
                    i['to'] if 'to' in i else None,
                    i['value'] if 'value' in i else 0,
                    i['name'] if 'name' in i else None,
                    i['params'] if 'params' in i else (),
                    i['abi'] if 'abi' in i else None,
                )
            elif i["type"] == "call":
                self.call(
                    i['from'] if 'from' in i else None,
                    i['to'] if 'to' in i else None,
                    i['value'] if 'value' in i else 0,
                    i['name'] if 'name' in i else None,
                    i['params'] if 'params' in i else (),
                    i['label'] if 'label' in i else None,
                    i['assertion'] if 'assertion' in i else None,
                    i['abi'] if 'abi' in i else None,
                )
        self.log('-'*96)
        self.log('Summary: {} gas used, {} Ether / {} Wei spent on gas'.format(self.total_gas,
                                                                               self.total_gas*self.gas_price/10.0**18,
                                                                               self.total_gas*self.gas_price))
        for reference, value in self.references.items():
            self.log('{} references {}'.format(reference, self.add_0x(value) if isinstance(value, unicode) else value))
        self.log('-' * 96)


@click.command()
@click.option('--f', help='File with instructions')
@click.option('--protocol', default="http", help='Ethereum node protocol')
@click.option('--host', default="localhost", help='Ethereum node host')
@click.option('--port', default='8545', help='Ethereum node port')
@click.option('--gas', default=4000000, help='Transaction gas')
@click.option('--gas-price', default=20000000000, help='Transaction gas price')
@click.option('--contract-dir', default="solidity", help='Path to contract directory')
@click.option('--optimize', is_flag=True, help='Use solidity optimizer to compile code')
@click.option('--account', help='Default account used as from parameter')
@click.option('--private-key-path', help='Path to private key')
def setup(f, protocol, host, port, gas, gas_price, contract_dir, optimize, account, private_key_path):
    deploy = EthDeploy(protocol, host, port, gas, gas_price, contract_dir, optimize, account, private_key_path)
    deploy.process(f)

if __name__ == '__main__':
    setup()
