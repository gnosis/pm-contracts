const Math = artifacts.require('Math')
const CampaignFactory = artifacts.require('CampaignFactory')

module.exports = function (deployer) {
    deployer.link(Math, CampaignFactory)
    deployer.deploy(CampaignFactory)
}
