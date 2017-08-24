// const HDWalletProvider = require('truffle-hdwallet-provider')

// let config = {
//     infuraAccessToken: '',
//     hdWalletMnemonic: 'bag path text august check lab grit fatigue antenna stem trouble cluster',
// }

// // eslint-disable-next-line no-empty
// try { Object.assign(config, require('./local-config')) } catch(e) { }

module.exports = {
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
        // ropsten: {
        //     network_id: "3",
        //     provider: new HDWalletProvider(config.hdWalletMnemonic, `https://ropsten.infura.io/${config.infuraAccessToken}`),
        // },
        // kovan: {
        //     network_id: "42",
        //     provider: new HDWalletProvider(config.hdWalletMnemonic, `https://kovan.infura.io/${config.infuraAccessToken}`),
        // },
        // rinkeby: {
        //     network_id: "4",
        //     provider: new HDWalletProvider(config.hdWalletMnemonic, `https://rinkeby.infura.io/${config.infuraAccessToken}`),
        //     gasPrice: 1e11,
        // },
    },
    mocha: {
        enableTimeouts: false,
        grep: process.env.TEST_GREP
    }
}
