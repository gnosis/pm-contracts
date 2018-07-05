const _ = require('lodash')

const utils = require('./utils')
const { Decimal, isClose, randrange, randnums, ONE, assertRejects } = utils

const MathLib = artifacts.require('Math')

const contracts = [MathLib]

contract('Math', function () {
    const MAX_SVALUE = Decimal(2).pow(255).sub(1)
    const MIN_SVALUE = Decimal(2).pow(255).neg()
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
        for(const x of
            [MIN_SVALUE, MIN_POWER, 0, MAX_POWER]
            .concat(randnums(MIN_SVALUE, MIN_POWER, 3))
            .concat(randnums(MIN_POWER, 0, 10))
            .concat(randnums(0, MAX_POWER, 10))
        ) {
            const X = Decimal(x.valueOf()).div(ONE)
            let actual
            try {
                actual = Decimal((await mathLib.exp.call(x.valueOf())).valueOf()).div(ONE)
            } catch(e) {
                throw new Error(`exp(${ X }) failed (${ x }): ${ e.message }`)
            }

            const expected = X.exp()

            assert(
                isClose(actual, expected),
                `Approximation of exp(${X.valueOf()}) doesn't match: ${actual.valueOf()} != ${expected.valueOf()}`
            )
        }

        for(let x of [MAX_POWER.add(1), MAX_SVALUE].concat(randnums(MAX_POWER.add(1), MAX_SVALUE, 10))) {
            await assertRejects(mathLib.exp(x.valueOf()), `exp(${x.div(ONE).valueOf()}) didn't reject!`)
        }
    })

    it('should compute bounds of log2', async () => {
        await assertRejects(mathLib.log2Bounds.call(0), "log2Bounds(0) didn't reject!")

        for(const x of
            [1, ONE, MAX_VALUE]
            .concat(randnums(1, MAX_VALUE, 10))
        ) {
            const X = new Decimal(x.valueOf()).div(ONE)
            let lower, upper
            try {
                [lower, upper] = (await mathLib.log2Bounds.call(x.valueOf()))
                    .map(bound => new Decimal(bound.valueOf()).div(ONE))
            } catch(e) {
                throw new Error(`log2Bounds(${ X }) failed (${ x }): ${ e.message }`)
            }

            const expected = Decimal.log2(X)

            assert(
                isClose(lower, expected),
                `Lower approximation of log2(${X.valueOf()}) doesn't match: ${lower.valueOf()} != ${expected.valueOf()}`
            )

            assert(
                lower.lte(expected),
                `Lower approximation of log2(${X.valueOf()}) wrong: ${lower.valueOf()} > ${expected.valueOf()}`
            )

            assert(
                isClose(upper, expected),
                `Upper approximation of log2(${X.valueOf()}) doesn't match: ${upper.valueOf()} != ${expected.valueOf()}`
            )

            assert(
                upper.gte(expected),
                `Upper approximation of log2(${X.valueOf()}) wrong:
                    U = ${upper.valueOf()}
                    E = ${expected.valueOf()}
                U - L = ${upper.sub(lower).valueOf()}
                E - U = ${expected.sub(upper).valueOf()}`
            )
        }
    })

    it('should compute bounds of pow2', async () => {
        const MAX_POWER = Decimal.log2(MAX_VALUE.div(ONE)).mul(ONE).floor()
        const MIN_POWER = Decimal.log2(Decimal(1).div(ONE)).mul(ONE).floor()
        for(const x of
            [
                MIN_SVALUE,
                MIN_POWER,
                0,
                MAX_POWER,
            ]
            .concat(randnums(MIN_SVALUE, MIN_POWER, 3))
            .concat(randnums(MIN_POWER, 0, 10))
            .concat(randnums(0, MAX_POWER, 10))
        ) {
            const X = new Decimal(x.valueOf()).div(ONE)
            let lower, upper
            try {
                [lower, upper] = (await mathLib.pow2Bounds.call(x.valueOf()))
                    .map(bound => new Decimal(bound.valueOf()).div(ONE))
            } catch(e) {
                throw new Error(`pow2Bounds(${ X }) failed (${ x }): ${ e.message }`)
            }

            const expected = Decimal.pow(2, X)

            assert(
                isClose(lower, expected),
                `Lower approximation of 2**(${X.valueOf()}) doesn't match: ${lower.valueOf()} != ${expected.valueOf()}`
            )

            assert(
                lower.lte(expected),
                `Lower approximation of 2**(${X.valueOf()}) wrong: ${lower.valueOf()} > ${expected.valueOf()}`
            )

            assert(
                isClose(upper, expected),
                `Upper approximation of 2**(${X.valueOf()}) doesn't match: ${upper.valueOf()} != ${expected.valueOf()}`
            )

            assert(
                upper.gte(expected),
                `Upper approximation of 2**(${X.valueOf()}) wrong:
                    U = ${upper.valueOf()}
                    E = ${expected.valueOf()}
                U - L = ${upper.sub(lower).valueOf()}
                E - U = ${expected.sub(upper).valueOf()}`
            )
        }

        for(const x of [MAX_POWER.add(1), MAX_SVALUE].concat(randnums(MAX_POWER.add(1), MAX_SVALUE, 10))) {
            await assertRejects(mathLib.pow2Bounds(x.valueOf()), `exp(${x.div(ONE).valueOf()}) didn't reject!`)
        }
    })

    it('should compute max', async () => {
        for(let seq of _.range(10).map(() => randnums(-100, 100, 10))) {
            assert.equal((await mathLib.max.call(seq)).valueOf(), Decimal.max(...seq).valueOf())
        }
    })
})
