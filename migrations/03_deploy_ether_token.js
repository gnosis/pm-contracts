module.exports = function (deployer) {
    deployer.deploy(artifacts.require('WETH9'))
    deployer.deploy(artifacts.require('WETH9'))
}