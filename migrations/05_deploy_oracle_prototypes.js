module.exports = function (deployer) {
    for(const contractName of [
        'CentralizedOracle',
        'FutarchyOracle',
        'MajorityOracle',
        'SignedMessageOracle',
        'UltimateOracle',
    ]) {
        deployer.deploy(artifacts.require(contractName))
    }
}
