const LMSRMarketMakerFactory = artifacts.require('LMSRMarketMakerFactory')

module.exports = function (deployer) {
    deployer.link(artifacts.require('Fixed192x64Math'), LMSRMarketMakerFactory)
    deployer.deploy(LMSRMarketMakerFactory)
}
