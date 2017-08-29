const config = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 40000000
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        ropsten: {
            host: "localhost",
            port: 8545,
            network_id: "3"
        },
        kovan: {
            host: "localhost",
            port: 8545,
            network_id: "42"
        },
        rinkeby: {
            host: "localhost",
            port: 8545,
            network_id: "4"
        },
    },
    mocha: {
        enableTimeouts: false,
        grep: process.env.TEST_GREP
    }
}

try {
    const _ = require('lodash')
    _.merge(config, require('./truffle-local'))
}
catch(e) {
    // eslint-disable-next-line no-console
    console.warn('Tried processing local config but got error:', e)
}

module.exports = config
