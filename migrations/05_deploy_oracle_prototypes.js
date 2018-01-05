const Math = artifacts.require('Math')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const DifficultyOracle = artifacts.require('DifficultyOracle')
const FutarchyOracle = artifacts.require('FutarchyOracle')
const MajorityOracle = artifacts.require('MajorityOracle')
const SignedMessageOracle = artifacts.require('SignedMessageOracle')
const UltimateOracle = artifacts.require('UltimateOracle')

const MAX_UINT = web3.toBigNumber(2).pow(256).sub(1)

module.exports = function (deployer) {
    deployer.link(Math, UltimateOracle)
    deployer.deploy([
        [CentralizedOracle, null, '\0'.repeat(46)],
        [DifficultyOracle, MAX_UINT],
        // FutarchyOracle,
        // MajorityOracle,
        SignedMessageOracle,
        [UltimateOracle, 1, 1, 2, 1, 1, 1],
    ])
}
