const Math = artifacts.require('Math')
const LMSRMarketMakerFactory = artifacts.require('LMSRMarketMakerFactory')

module.exports = function (deployer) {
    deployer.link(Math, LMSRMarketMakerFactory)
    deployer.deploy(LMSRMarketMakerFactory)
}
