const Fixed192x64Math = artifacts.require('Fixed192x64Math')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')

module.exports = function (deployer) {
    deployer.link(Fixed192x64Math, LMSRMarketMaker)
    deployer.deploy(LMSRMarketMaker)
}
