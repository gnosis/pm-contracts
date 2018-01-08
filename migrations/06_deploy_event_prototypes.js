const Math = artifacts.require('Math')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')

module.exports = function (deployer) {
    deployer.link(Math, [CategoricalEvent, ScalarEvent])
    deployer.deploy([
        CategoricalEvent,
        ScalarEvent,
    ])
}
