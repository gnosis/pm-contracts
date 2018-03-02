/* eslint-disable no-console */

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const buildFolder = 'build'
const gasStatsFile = path.join(buildFolder, 'gas-stats.json')

try {
    fs.mkdirSync(buildFolder)
} catch(e) {
    if(e.code !== 'EEXIST') {
        console.warn(`Could not create ${buildFolder}: ${e}`)
    }
}

try {
    fs.unlinkSync(gasStatsFile)
} catch(e) {
    if(e.code !== 'ENOENT') {
        console.warn(`Could not delete ${gasStatsFile}: ${e}`)
    }
}

const newEnv = Object.assign({}, process.env)
newEnv.COLLECT_GAS_STATS = true
spawnSync('npm', ['test'], { stdio: 'inherit', env: newEnv })

const gasStats = JSON.parse(fs.readFileSync(gasStatsFile))

// make sure this is toposorted
const inheritanceMap = [
    ['Event', ['CategoricalEvent', 'ScalarEvent']],
    ['StandardMarket', ['StandardMarketWithPriceLogger']],
    ['Market', ['StandardMarket']],
    ['MarketMaker', ['LMSRMarketMaker']],
    ['Oracle', ['CentralizedOracle', 'DifficultyOracle', 'FutarchyOracle', 'MajorityOracle', 'SignedMessageOracle', 'UltimateOracle']],
    ['StandardToken', ['EtherToken', 'OutcomeToken']],
    ['Token', ['StandardToken']],
]

inheritanceMap.forEach(([parent, children]) => {
    const childrenData = children.map(name => gasStats[name]).filter(data => data)
    if(childrenData.length === 0) return
    if(!gasStats[parent])
        gasStats[parent] = {}

    _.mergeWith(gasStats[parent], ...childrenData, (objValue, srcValue) =>
        _.isArray(objValue) ? objValue.concat(srcValue) : undefined)
})

console.log('-- Gas stats --')

_.forEach(gasStats, (contractData, contractName) => {
    if(!contractData) return

    console.log(`Contract: ${contractName}`)
    _.forEach(contractData, (fnData, fnName) => {
        fnData.averageGasUsed = fnData.data.reduce((acc, datum) => acc + datum.gasUsed, 0) / fnData.data.length
        const sortedData = _.sortBy(fnData.data, 'gasUsed')
        fnData.min = sortedData[0]
        fnData.max = sortedData[sortedData.length - 1]
        fnData.median = sortedData[(sortedData.length / 2) | 0]
        console.log(`  ${fnName}:
    min: ${fnData.min.gasUsed}
    max: ${fnData.max.gasUsed}
    avg: ${fnData.averageGasUsed}
    med: ${fnData.median.gasUsed}`)
    })
    console.log()
})

fs.writeFileSync(gasStatsFile, JSON.stringify(gasStats, null, 2))
