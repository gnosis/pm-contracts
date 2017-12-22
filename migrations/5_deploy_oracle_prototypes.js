const CentralizedOracle = artifacts.require('CentralizedOracle')
const DifficultyOracle = artifacts.require('DifficultyOracle')
const SignedMessageOracle = artifacts.require('SignedMessageOracle')
const UltimateOracle = artifacts.require('UltimateOracle')

const MAX_UINT = web3.toBigNumber(2).pow(256).sub(1)

module.exports = function (deployer) {
    deployer.deploy([
        [CentralizedOracle, null, '\0'.repeat(46)],
        [DifficultyOracle, MAX_UINT],
        SignedMessageOracle
    ])
}
