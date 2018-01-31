const Math = artifacts.require('Math')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const EventFactory = artifacts.require('EventFactory')

module.exports = function (deployer) {
    deployer.link(Math, EventFactory)
    deployer.deploy(EventFactory, CategoricalEvent.address, ScalarEvent.address)
}
