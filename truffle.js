const config = {
    networks: {
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01,
        },
        mainnet: {
            host: "localhost",
            port: 8545,
            network_id: "1",
        },
        ropsten: {
            host: "localhost",
            port: 8545,
            network_id: "3",
        },
        kovan: {
            host: "localhost",
            port: 8545,
            network_id: "42",
        },
        rinkeby: {
            host: "localhost",
            port: 8545,
            network_id: "4",
        },
        quickstart: {
            host: "localhost",
            port: 8545,
            network_id: "437894314312",
        }
    },
    mocha: {
        enableTimeouts: false,
        grep: process.env.TEST_GREP
    },
	compilers: {
		solc: {
			version: "0.5.6"
		}
	}
}

const _ = require('lodash')

try {
    _.merge(config, require('./truffle-local'))
}
catch(e) {
    if(e.code === 'MODULE_NOT_FOUND' && e.message.includes('truffle-local')) {
        // eslint-disable-next-line no-console
        console.log('No local truffle config found. Using all defaults...')
    } else {
        // eslint-disable-next-line no-console
        console.warn('Tried processing local config but got error:', e)
    }
}

module.exports = config
