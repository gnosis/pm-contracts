module.exports = function (deployer) {
    [
        'CentralizedOracle',
    ].forEach(contractName => {
        const contract = artifacts.require(contractName)
        const factory = artifacts.require(contractName + 'Factory')
        deployer.deploy(factory, contract.address)
    })
}
