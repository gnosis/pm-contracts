module.exports = function (deployer) {
    [
        'CentralizedOracle',
        'DifficultyOracle',
        'MajorityOracle',
        'SignedMessageOracle',
        'UltimateOracle',
    ].forEach(contractName => {
        const contract = artifacts.require(contractName)
        const factory = artifacts.require(contractName + 'Factory')
        factory._json.unlinked_binary = factory._json.unlinked_binary
            .replace('c0ffeecafec0ffeecafec0ffeecafec0ffeecafe', contract.address.replace('0x', ''))
        deployer.deploy(factory)
    })
}
