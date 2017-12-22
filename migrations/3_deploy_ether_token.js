const Math = artifacts.require('Math')
const EtherToken = artifacts.require('EtherToken')

module.exports = function (deployer) {
    deployer.link(Math, EtherToken)
    deployer.deploy(EtherToken)
}
