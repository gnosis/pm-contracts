const CentralizedOracle = artifacts.require('CentralizedOracle')
const FutarchyOracle = artifacts.require('FutarchyOracle')
const MajorityOracle = artifacts.require('MajorityOracle')
const SignedMessageOracle = artifacts.require('SignedMessageOracle')
const UltimateOracle = artifacts.require('UltimateOracle')

module.exports = function (deployer) {
    deployer.deploy([
        CentralizedOracle,
        FutarchyOracle,
        MajorityOracle,
        SignedMessageOracle,
        UltimateOracle,
    ])
}
