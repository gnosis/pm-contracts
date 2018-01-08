const fs = require('fs')
const path = require('path')

module.exports = function(deployer) {
    [
        'CentralizedOracle',
        'DifficultyOracle',
        'MajorityOracle',
        'SignedMessageOracle',
        'UltimateOracle',
        'Event',
        'StandardMarket',
        'StandardMarketWithPriceLogger',
        'Campaign',
        'FutarchyOracle',
    ].forEach(instanceContract => {
        try {
            const artifactPath = path.join(__dirname, '..', 'build', 'contracts', `${ instanceContract }Factory.json`)
            const artifact = JSON.parse(fs.readFileSync(artifactPath))
            delete artifact.unlinked_bytecode
            fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2))
        } catch(e) {
            if(e.code !== 'ENOENT')
                throw e
        }
    })
}
