const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const OutcomeToken = artifacts.require('OutcomeToken')

module.exports = function (deployer) {
    deployer.deploy([
        CategoricalEvent,
        ScalarEvent,
        OutcomeToken,
    ])
}
