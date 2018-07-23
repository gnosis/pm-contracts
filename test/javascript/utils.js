const _ = require('lodash')

const PRECISION = 80
const Decimal = require('decimal.js').clone({ precision: PRECISION })

const ONE = Decimal(2).pow(64)

function isClose(a, b, relTol=1e-9, absTol=1e-18) {
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

Object.assign(exports, {
    Decimal,
    ONE,
    isClose,
    randrange,
    randnums,
    getParamFromTxEvent,
    assertRejects,
    lmsrMarginalPrice,
})
