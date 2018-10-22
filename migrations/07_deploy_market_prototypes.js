module.exports = function (deployer) {
    for(const contractName of [
        'StandardMarket',
        'StandardMarketWithPriceLogger',
    ]) {
        deployer.deploy(artifacts.require(contractName))
    }
}
