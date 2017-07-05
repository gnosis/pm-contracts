const HDWalletProvider = require("truffle-hdwallet-provider")
const fs = require("fs")

//address info for acct used to deploy contracts on kovan
//address: 0x00200eB02C014831EBa45978415c30cf7110b329
//*note: parity wallet was used to deploy (not remote provider)

//address info for acct used to deploy contracts on rinkeby
//address: 0x069fd4784D1DEd8A63923e83fF73c44414240043
let mnemonic = 'stool arrow fatigue sunny actual bind radio license enemy peanut penalty soccer';


module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        kovan: {
            host: "localhost",
            port: 8545,
            network_id: "42"
        },
        rinkeby: {
            provider: new HDWalletProvider(mnemonic, "https://rinkeby.infura.io"),
            network_id: "*",
            gas: 4500000,
            gasPrice: 25000000000
        },
    }
}
