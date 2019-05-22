module.exports = function (deployer) {
    for(const contractName of [
        'StandardMarket',
        'StandardMarketWithPriceLogger',
        'GnosisSightMarket'
    ]) {
        deployer.deploy(artifacts.require(contractName))
    }
}
