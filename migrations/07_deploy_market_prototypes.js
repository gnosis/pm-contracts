const Math = artifacts.require('Math')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const StandardMarket = artifacts.require('StandardMarket')

module.exports = function (deployer) {
    deployer.link(Math, StandardMarket)
    deployer.deploy(StandardMarket, null, CategoricalEvent.address, 1, 0)
}
