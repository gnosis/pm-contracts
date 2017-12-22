const Math = artifacts.require('Math')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')

module.exports = function (deployer) {
    deployer.link(Math, [CategoricalEvent, ScalarEvent])
    deployer.deploy([
        [CategoricalEvent, 1, 1, 2],
        [ScalarEvent, 1, 1, 0, 1],
    ])
}
