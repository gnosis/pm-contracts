const fs =require('fs')

const _ = require('lodash')

const PRECISION = 80
const Decimal = require('decimal.js').clone({ precision: PRECISION })

const ONE = Decimal(2).pow(64)

function isClose(a, b, relTol=1e9, absTol=1e18) {
    return Decimal(a.valueOf()).sub(b).abs().lte(
        Decimal.max(
            Decimal.max(
                Decimal.abs(a.valueOf()),
                Decimal.abs(b.valueOf())
            ).mul(relTol),
            absTol))
}

// random int in [a, b)
function randrange(a, b) {
    return Decimal.random(PRECISION).mul(Decimal(b.valueOf()).sub(a)).add(a).floor()
}

function randnums(a, b, n) {
    return _.range(n).map(() => randrange(a, b))
}

function getParamFromTxEvent(transaction, paramName, contractFactory, eventName) {
    assert.isObject(transaction)
    let logs = transaction.logs
    if(eventName != null) {
        logs = logs.filter((l) => l.event === eventName)
    }
    assert.equal(logs.length, 1, 'too many logs found!')
    let param = logs[0].args[paramName]
    if(contractFactory != null) {
        let contract = contractFactory.at(param)
        assert.isObject(contract, `getting ${paramName} failed for ${param}`)
        return contract
    } else {
        return param
    }
}

async function assertRejects(q, msg) {
    let res, catchFlag = false
    try {
        res = await q
    } catch(e) {
        catchFlag = true
    } finally {
        if(!catchFlag)
            assert.fail(res, null, msg)
    }
}

function lmsrMarginalPrice(funding, netOutcomeTokensSold, outcomeIndex) {
    const b = Decimal(funding.valueOf()).div(netOutcomeTokensSold.length).ln()

    return Decimal(netOutcomeTokensSold[outcomeIndex].valueOf()).div(b).exp().div(
        netOutcomeTokensSold.reduce(
            (acc, tokensSold) => acc.add(Decimal(tokensSold.valueOf()).div(b).exp()),
            Decimal(0)
        )
    ).valueOf()
}

function setupProxiesForGasStats(instance, gasStats) {
    new Set(instance.abi
        .filter(({ type, constant }) => type === 'function' && !constant)
    ).forEach(({ name: fnName, outputs: fnOutputs }) => {
        const originalFn = instance[fnName]
        instance[fnName] = async function () {
            const result = await originalFn.apply(this, arguments)
            const datum = {
                args: Array.from(arguments).slice(0, fnOutputs.length),
                gasUsed: result.receipt.gasUsed,
            }

            let fnGasStats = gasStats[fnName]

            if(fnGasStats == null) {
                fnGasStats = {
                    data: [],
                }
                gasStats[fnName] = fnGasStats
            }

            fnGasStats.data.push(datum)

            return result
        }
    })
}


function createGasStatCollectorBeforeHook(contracts) {
    return () => {
        if(process.env.COLLECT_GAS_STATS) {
            contracts.forEach((contract) => {
                contract.gasStats = {}

                const originalDeployed = contract.deployed
                contract.deployed = async function () {
                    const instance = await originalDeployed.apply(this, arguments)
                    setupProxiesForGasStats(instance, contract.gasStats)
                    return instance
                }

                const originalAt = contract.at
                contract.at = function () {
                    const instance = originalAt.apply(this, arguments)
                    setupProxiesForGasStats(instance, contract.gasStats)
                    return instance
                }
            })
        }
    }
}

const gasStatsFile = 'build/gas-stats.json'

function createGasStatCollectorAfterHook(contracts) {
    return () => {
        if(process.env.COLLECT_GAS_STATS) {
            const collectedData = _.fromPairs(contracts.map((contract) => [
                contract.contract_name,
                contract.gasStats,
            ]))

            let existingData
            try {
                existingData = JSON.parse(fs.readFileSync(gasStatsFile))
            } catch (e) {
                fs.writeFileSync(gasStatsFile, JSON.stringify(collectedData, null, 2))
                return
            }

            _.forEach(collectedData, (contractData, contractName) => {
                const existingContractData = existingData[contractName]
                if(existingContractData != null) {
                    _.forEach(contractData, (fnData, fnName) => {
                        const existingFnData = existingContractData[fnName]
                        if(existingFnData != null) {
                            Array.prototype.push.apply(existingFnData.data, fnData.data)
                        } else {
                            existingContractData[fnName] = fnData
                        }
                    })
                } else {
                    existingData[contractName] = contractData
                }
            })

            fs.writeFileSync(gasStatsFile, JSON.stringify(existingData, null, 2))
        }
    }
}

Object.assign(exports, {
    Decimal,
    ONE,
    isClose,
    randrange,
    randnums,
    getParamFromTxEvent,
    assertRejects,
    lmsrMarginalPrice,
    createGasStatCollectorBeforeHook,
    createGasStatCollectorAfterHook,
})
