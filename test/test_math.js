const _ = require('lodash')

const utils = require('./utils')
const { Decimal, isClose, randrange, randnums, ONE, assertRejects } = utils

const MathLib = artifacts.require('Math')

const contracts = [MathLib]

contract('Math', function () {
    const MAX_SVALUE = Decimal(2).pow(255).sub(1)
    const MAX_VALUE = Decimal(2).pow(256).sub(1)
    let mathLib

    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        mathLib = await MathLib.deployed()
    })

    it('should compute ln', async () => {
        await assertRejects(mathLib.ln(0), "ln(0) didn't reject!")

        for(let x of [1, ONE, MAX_VALUE, randrange(1, MAX_VALUE)].concat(randnums(1, MAX_VALUE, 10))) {
            let X = Decimal(x.valueOf()).div(ONE)
            let actual = Decimal((await mathLib.ln.call(x.valueOf())).div(ONE.valueOf()).valueOf())
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
            let actual = Decimal((await mathLib.exp.call(x.valueOf())).valueOf()).div(ONE)
            let expected = X.exp()
            assert(
                isClose(actual, expected),
                `Approximation of exp(${X.valueOf()}) doesn't match: ${actual.valueOf()} != ${expected.valueOf()}`
            )
        }

        for(let x of [MAX_POWER.add(1), MAX_SVALUE].concat(randnums(MAX_POWER.add(1), MAX_SVALUE, 10))) {
            await assertRejects(mathLib.exp(x.valueOf()), `exp(${x.div(ONE).valueOf()}) didn't reject!`)
        }
    })

    it('should compute max', async () => {
        for(let seq of _.range(10).map(() => randnums(-100, 100, 10))) {
            assert.equal((await mathLib.max.call(seq)).valueOf(), Decimal.max(...seq).valueOf())
        }
    })
})
