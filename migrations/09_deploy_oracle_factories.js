const Math = artifacts.require('Math')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const DifficultyOracleFactory = artifacts.require('DifficultyOracleFactory')
// const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
const MajorityOracleFactory = artifacts.require('MajorityOracleFactory')
const SignedMessageOracleFactory = artifacts.require('SignedMessageOracleFactory')
const UltimateOracleFactory = artifacts.require('UltimateOracleFactory')

module.exports = function (deployer) {
    deployer.link(Math, UltimateOracleFactory)
    deployer.deploy([
        CentralizedOracleFactory,
        DifficultyOracleFactory,
        // FutarchyOracleFactory,
        MajorityOracleFactory,
        SignedMessageOracleFactory,
        UltimateOracleFactory
    ])
}
