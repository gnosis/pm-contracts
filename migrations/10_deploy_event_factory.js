const Math = artifacts.require('Math')
const EventFactory = artifacts.require('EventFactory')

module.exports = function (deployer) {
    deployer.link(Math, EventFactory)
    deployer.deploy(EventFactory)
}
