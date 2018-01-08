const Math = artifacts.require('Math')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const EventFactory = artifacts.require('EventFactory')

module.exports = function (deployer) {
    deployer.link(Math, EventFactory)
    EventFactory._json.unlinked_binary = EventFactory._json.unlinked_binary
        .replace('c0ffeecafec0ffeecafec0ffeecafec0ffeecafe', CategoricalEvent.address.replace('0x', ''))
        .replace('1ce1cebabe1ce1cebabe1ce1cebabe1ce1cebabe', ScalarEvent.address.replace('0x', ''))
    deployer.deploy(EventFactory)
}
