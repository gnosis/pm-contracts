const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const dir = path.join('build', 'contracts')

const contractNetworksMap = JSON.parse(fs.readFileSync('networks.json'))

_.toPairs(contractNetworksMap)
    .map(([name, networks]) => [path.join(dir, name + '.json'), networks])
    .filter(([file, _networks]) => {
        if(!fs.existsSync(file))
            throw new Error(`missing build artifact ${file}; make sure contracts are compiled`)
        return true
    })
    .forEach(([file, networks]) => {
        const artifactData = JSON.parse(fs.readFileSync(file))
        _.merge(artifactData.networks, networks)
        fs.writeFileSync(file, JSON.stringify(artifactData, null, 2))
    })
