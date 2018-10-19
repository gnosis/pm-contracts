const StandardMarket = artifacts.require('StandardMarket')
const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')

module.exports = function (deployer) {
    deployer.deploy([
        StandardMarket,
        StandardMarketWithPriceLogger,
    ])
}
