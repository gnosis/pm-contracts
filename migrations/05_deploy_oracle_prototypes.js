const Math = artifacts.require('Math')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const FutarchyOracle = artifacts.require('FutarchyOracle')
const MajorityOracle = artifacts.require('MajorityOracle')
const SignedMessageOracle = artifacts.require('SignedMessageOracle')
const UltimateOracle = artifacts.require('UltimateOracle')

const MAX_UINT = web3.toBigNumber(2).pow(256).sub(1)

module.exports = function (deployer) {
    deployer.link(Math, UltimateOracle)
    deployer.deploy([
        CentralizedOracle,
        FutarchyOracle,
        MajorityOracle,
        SignedMessageOracle,
        UltimateOracle,
    ])
}
