module.exports = function (deployer) {
    for(const contractName of [
        'CategoricalEvent',
        'ScalarEvent',
        'OutcomeToken',
    ]) {
        deployer.deploy(artifacts.require(contractName))
    }
}
