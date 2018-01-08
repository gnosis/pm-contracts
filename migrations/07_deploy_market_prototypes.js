const Math = artifacts.require('Math')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const StandardMarket = artifacts.require('StandardMarket')
const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')

module.exports = function (deployer) {
    deployer.link(Math, [StandardMarket, StandardMarketWithPriceLogger])
    deployer.deploy([
        StandardMarket,
        StandardMarketWithPriceLogger,
    ])
}
