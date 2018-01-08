const Campaign = artifacts.require('Campaign')
const CampaignFactory = artifacts.require('CampaignFactory')

module.exports = function (deployer) {
    CampaignFactory._json.unlinked_binary = CampaignFactory._json.unlinked_binary
        .replace('c0ffeecafec0ffeecafec0ffeecafec0ffeecafe', Campaign.address.replace('0x', ''))
    deployer.deploy(CampaignFactory)
}
