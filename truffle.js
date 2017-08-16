module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 0x2625A00, // 40000000
            gasPrice: 0x01
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0x2625A00,
            gasPrice: 0x01
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
