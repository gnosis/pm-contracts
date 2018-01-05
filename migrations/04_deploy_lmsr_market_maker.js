const Math = artifacts.require('Math')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')

module.exports = function (deployer) {
    deployer.link(Math, LMSRMarketMaker)
    deployer.deploy(LMSRMarketMaker)
}
