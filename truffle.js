const config = {
    networks: {
        mainnet: {
            host: "localhost",
            port: 8545,
            network_id: "1",
        },
        development: {
            host: 'localhost',
            port: 7545,
            network_id: '*', 
            gasPrice: 20000000000 
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
    },
    mocha: {
        enableTimeouts: false,
        grep: process.env.TEST_GREP
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
