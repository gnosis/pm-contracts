const Math = artifacts.require('Math')
const StandardMarket = artifacts.require('StandardMarket')
const prox = artifacts.require('C0ffeeProxy')

module.exports = function (deployer) {
    // deployer.link(Math, StandardMarket)
    // deployer.deploy(StandardMarket, null, 1, 1)
    deployer.deploy(prox)
}
