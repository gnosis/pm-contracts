const _ = require('lodash')

const PRECISION = 80
const Decimal = require('decimal.js').clone({ precision: PRECISION })
const BigNumber = require('bignumber.js')

const utils = require('./utils')

const MathLib = artifacts.require('Math')

const ONE = Decimal(2).pow(64)

function isClose(a, b, relTol=1e9, absTol=1e18) {
    return a.sub(b).abs().lte(Decimal.max(Decimal.max(a.abs(),b.abs()).mul(relTol),absTol))
}

// random int in [a, b)
function randrange(a, b) {
    return Decimal.random(PRECISION).mul(Decimal(b.valueOf()).sub(a)).add(a).floor()
}

function randnums(a, b, n) {
    return _.range(n).map(() => randrange(a, b))
}

contract('Math', function () {
    const MAX_SVALUE = Decimal(2).pow(255).sub(1)
    const MAX_VALUE = Decimal(2).pow(256).sub(1)
    let mathLib

    beforeEach(async () => {
        mathLib = await MathLib.deployed()
    })

    it('should compute ln', async () => {
        await utils.assertRejects(mathLib.ln(0), "ln(0) didn't reject!")

        for(let x of [1, ONE, MAX_VALUE, randrange(1, MAX_VALUE)].concat(randnums(1, MAX_VALUE, 10))) {
            let X = Decimal(x.valueOf()).div(ONE)
            let actual = Decimal((await mathLib.ln(x)).div(ONE.valueOf()).valueOf())
            let expected = X.ln()
            assert(
                isClose(actual, expected),
                `Approximation of ln(${X.valueOf()}) doesn't match: ${actual.valueOf()} != ${expected.valueOf()}`
            )
        }
    })

    it('should compute exp', async () => {
        const MAX_POWER = MAX_VALUE.div(ONE).ln().mul(ONE).floor()
        const MIN_POWER = Decimal(1).div(ONE).ln().mul(ONE).floor()
        for(let x of [MAX_SVALUE.neg(), MIN_POWER, 0, MAX_POWER].concat(randnums(MAX_SVALUE.neg(), MAX_POWER, 10))) {
            let X = Decimal(x.valueOf()).div(ONE)
            let actual = Decimal((await mathLib.exp(x)).div(ONE.valueOf()).valueOf())
            let expected = X.exp()
            assert(
                isClose(actual, expected),
                `Approximation of exp(${X.valueOf()}) doesn't match: ${actual.valueOf()} != ${expected.valueOf()}`
            )
        }

        for(let x of [MAX_POWER.add(1), MAX_SVALUE].concat(randnums(MAX_POWER.add(1), MAX_SVALUE, 10))) {
            await utils.assertRejects(mathLib.exp(x.valueOf()), `exp(${x.div(ONE).valueOf()}) didn't reject!`)
        }
    })

    it('should compute max', async () => {
        for(let seq of _.range(10).map(() => randnums(-100, 100, 10))) {
            assert.equal((await mathLib.max.call(seq)).valueOf(), Decimal.max(...seq).valueOf())
        }
    })
})
