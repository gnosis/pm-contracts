const Math = artifacts.require('Math')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const OutcomeToken = artifacts.require('OutcomeToken')

module.exports = function (deployer) {
    deployer.link(Math, [CategoricalEvent, ScalarEvent, OutcomeToken])
    deployer.deploy([
        CategoricalEvent,
        ScalarEvent,
        OutcomeToken,
    ])
}
