from ethereum import _solidity
from subprocess import CalledProcessError
import click
import json
import logging
import os


# create logger
logger = logging.getLogger('ABI')
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


class EthABI:

    def __init__(self, f, contract_dir, abi_dir):
        self.f = f
        self.contract_dir = contract_dir
        self.abi_dir = abi_dir

    @staticmethod
    def log(string):
        logger.info(string)

    @staticmethod
    def get_file_name(file_path):
        return file_path.split("/")[-1].split(".")[0]

    def create_abi(self, file_path):
        # create list of valid paths
        absolute_path = self.contract_dir if self.contract_dir.startswith('/') else '{}/{}'.format(os.getcwd(),
                                                                                                   self.contract_dir)
        sub_dirs = [x[0] for x in os.walk(absolute_path)]
        extra_args = ' '.join(['{}={}'.format(d.split('/')[-1], d) for d in sub_dirs])
        try:
            return _solidity.compile_last_contract(file_path, combined='abi', extra_args=extra_args)['abi']
        except CalledProcessError:
            file_name = self.get_file_name(file_path)
            logger.error('Error: {} ABI not generated.'.format(file_name))

    def save_abi(self, file_path, abi):
        file_name = self.get_file_name(file_path)
        with open('{}/{}.json'.format(self.abi_dir, file_name), 'w+') as abi_file:
            abi_file.write(json.dumps(abi))
            abi_file.close()
        logger.info('{} ABI generated.'.format(file_name))

    def process(self):
        if self.f:
            abi = self.create_abi(self.f)
            if abi:
                self.save_abi(self.f, abi)
        else:
            for root, directories, files in os.walk(self.contract_dir):
                for file_name in files:
                    if file_name.endswith('.sol'):
                        file_path = os.path.join(root, file_name)
                        abi = self.create_abi(file_path)
                        if abi:
                            self.save_abi(file_path, abi)


@click.command()
@click.option('--f', help='Path to contract')
@click.option('--contract-dir', default="solidity", help='Path to contract directory')
@click.option('--abi-dir', default="abi", help='Path to contract directory')
def setup(f, contract_dir, abi_dir):
    eth_abi = EthABI(f, contract_dir, abi_dir)
    eth_abi.process()

if __name__ == '__main__':
    setup()
