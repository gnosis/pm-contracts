const Math = artifacts.require('Math')
const Campaign = artifacts.require('Campaign')

module.exports = function(deployer) {
    deployer.link(Math, Campaign)
    deployer.deploy(Campaign)
}
