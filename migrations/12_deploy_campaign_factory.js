const Campaign = artifacts.require('Campaign')
const CampaignFactory = artifacts.require('CampaignFactory')

module.exports = function (deployer) {
    deployer.deploy(CampaignFactory, Campaign.address)
}
