module.exports = function (deployer) {
    [
        'StandardMarket',
        'StandardMarketWithPriceLogger',
    ].forEach(contractName => {
        const contract = artifacts.require(contractName)
        const factory = artifacts.require(contractName + 'Factory')
        deployer.deploy(factory, contract.address)
    })
}
