module.exports = function (deployer) {
    [
        'CentralizedOracle',
        'MajorityOracle',
        'SignedMessageOracle',
        'UltimateOracle',
    ].forEach(contractName => {
        const contract = artifacts.require(contractName)
        const factory = artifacts.require(contractName + 'Factory')
        deployer.deploy(factory, contract.address)
    })
    deployer.deploy(artifacts.require('DifficultyOracleFactory'))
}
