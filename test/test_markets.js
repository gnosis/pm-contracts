const NewWeb3 = require('web3')
const { wait } = require('@digix/tempo')(web3)
const testGas = require('@gnosis.pm/truffle-nice-tools').testGas

const utils = require('./utils')
const { getBlock, getParamFromTxEvent, assertRejects, Decimal, randnums } = utils

const CategoricalEvent = artifacts.require('CategoricalEvent')
const EventFactory = artifacts.require('EventFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const LMSRMarketMakerFactory = artifacts.require('LMSRMarketMakerFactory')

const contracts = [CategoricalEvent, EventFactory, OutcomeToken, WETH9, LMSRMarketMaker, LMSRMarketMakerFactory]

contract('LMSRMarketMaker', function (accounts) {
    let eventFactory
    let etherToken
    let lmsrMarketMakerFactory
    let ipfsHash, centralizedOracle, event
    const numOutcomes = 2

    before(testGas.createGasStatCollectorBeforeHook(contracts))
    after(testGas.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        eventFactory = await EventFactory.deployed()
        etherToken = await WETH9.deployed()
        lmsrMarketMakerFactory = await LMSRMarketMakerFactory.deployed()

        // create event
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        centralizedOracle = accounts[1]
        event = getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, centralizedOracle, numOutcomes),
            'categoricalEvent', CategoricalEvent
        )
    })

    it('can be created and closed', async () => {
        // Create lmsrMarketMaker
        const buyer = 5

        const feeFactor = 0
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(event.address, feeFactor, { from: accounts[buyer] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Fund lmsrMarketMaker
        const funding = 100

        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[buyer] })
        await lmsrMarketMaker.fund(funding, { from: accounts[buyer] })

        // LMSRMarketMaker can only be funded once
        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)
        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[buyer] })
        await assertRejects(lmsrMarketMaker.fund(funding, { from: accounts[buyer] }), 'lmsrMarketMaker funded twice')

        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        // Close lmsrMarketMaker
        await lmsrMarketMaker.close({ from: accounts[buyer] })

        // LMSRMarketMaker can only be closed once
        await assertRejects(lmsrMarketMaker.close({ from: accounts[buyer] }), 'lmsrMarketMaker closed twice')

        // Sell all outcomes
        await event.sellAllOutcomes(funding, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding * 2)
    })

    it('should allow buying and selling', async () => {
        // create lmsrMarketMaker
        const investor = 0

        const feeFactor = 5e16  // 5%
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(event.address, feeFactor, { from: accounts[investor] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Fund lmsrMarketMaker
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[investor] })

        await lmsrMarketMaker.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Buy outcome tokens
        const buyer = 1
        const outcome = 0
        const tokenCount = 1e15
        let outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)

        let fee = await lmsrMarketMaker.calcMarketFee.call(outcomeTokenCost)
        assert.equal(fee, Math.floor(outcomeTokenCost * 5 / 100))

        const cost = fee.add(outcomeTokenCost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.valueOf())

        await etherToken.approve(lmsrMarketMaker.address, cost, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await lmsrMarketMaker.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        ), outcomeTokenCost.valueOf())

        const outcomeToken = OutcomeToken.at(await event.outcomeTokens.call(outcome))
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        // Sell outcome tokens
        outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? -tokenCount : 0)
        const outcomeTokenProfit = (await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)).neg()
        fee = await lmsrMarketMaker.calcMarketFee.call(outcomeTokenProfit)
        const profit = outcomeTokenProfit.sub(fee)

        await outcomeToken.approve(lmsrMarketMaker.address, tokenCount, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await lmsrMarketMaker.trade(outcomeTokenAmounts, -profit, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        ).neg().valueOf(), outcomeTokenProfit.valueOf())

        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), profit.valueOf())
    })

    it('should allow short selling', async () => {
        // create lmsrMarketMaker
        const investor = 7

        const feeFactor = 50000  // 5%
        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(event.address, feeFactor, { from: accounts[investor] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Fund lmsrMarketMaker
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal((await etherToken.balanceOf.call(accounts[investor])).valueOf(), funding)

        await etherToken.approve(lmsrMarketMaker.address, funding, { from: accounts[investor] })

        await lmsrMarketMaker.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Short sell outcome tokens
        const buyer = 7
        const outcome = 0
        const differentOutcome = 1
        const tokenCount = 1e15
        const outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i !== outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)
        const fee = await lmsrMarketMaker.calcMarketFee.call(outcomeTokenCost)
        const cost = outcomeTokenCost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.valueOf())
        await etherToken.approve(lmsrMarketMaker.address, cost, { from: accounts[buyer] })

        assert.equal(
            getParamFromTxEvent(
                await lmsrMarketMaker.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }),
                'outcomeTokenNetCost'
            ).valueOf(), outcomeTokenCost.valueOf())
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)
        const outcomeToken = OutcomeToken.at(await event.outcomeTokens.call(differentOutcome))
                'cost', null, 'OutcomeTokenShortSale'
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
    })

    it('trading stress testing', async () => {
        const MAX_VALUE = Decimal(2).pow(256).sub(1)

        const trader = 9
        const feeFactor = 0

        const lmsrMarketMaker = getParamFromTxEvent(
            await lmsrMarketMakerFactory.createLMSRMarketMaker(event.address, feeFactor, { from: accounts[trader] }),
            'lmsrMarketMaker', LMSRMarketMaker
        )

        // Get ready for trading
        await etherToken.deposit({ value: 2e19, from: accounts[trader] })
        await etherToken.approve(event.address, 1e19, { from: accounts[trader] })
        await event.buyAllOutcomes(1e19, { from: accounts[trader] })

        // Allow all trading
        const outcomeTokens = (await Promise.all(
            _.range(numOutcomes).map(i => event.outcomeTokens.call(i))
        )).map(OutcomeToken.at)

        await etherToken.approve(lmsrMarketMaker.address, MAX_VALUE.valueOf(), { from: accounts[trader] })
        await Promise.all(outcomeTokens.map(outcomeToken =>
            outcomeToken.approve(lmsrMarketMaker.address, MAX_VALUE.valueOf(), { from: accounts[trader] })))

        // Fund lmsrMarketMaker
        const funding = 1e16
        await lmsrMarketMaker.fund(funding, { from: accounts[trader] })

        for(let i = 0; i < 100; i++) {
            const outcomeTokenAmounts = randnums(-1e16, 1e16, numOutcomes).map(n => n.valueOf())
            const netCost = await lmsrMarketMaker.calcNetCost.call(outcomeTokenAmounts)

            const lmsrMarketMakerOutcomeTokenCounts = await Promise.all(outcomeTokens.map(outcomeToken =>
                outcomeToken.balanceOf.call(lmsrMarketMaker.address)))

            const lmsrMarketMakerCollateralTokenCount = await etherToken.balanceOf.call(lmsrMarketMaker.address)

            let txResult;
            try {
                txResult = await lmsrMarketMaker.trade(outcomeTokenAmounts, netCost, { from: accounts[trader] })
            } catch(e) {
                throw new Error(`trade ${ i } with input ${
                    outcomeTokenAmounts
                } and limit ${
                    netCost
                } failed while lmsrMarketMaker has:\n\n${
                    lmsrMarketMakerOutcomeTokenCounts.map(c => c.valueOf()).join('\n')
                }\n\nand ${
                    lmsrMarketMakerCollateralTokenCount.valueOf()
                }: ${
                    e.message
                }`)
            }

            if(txResult)
                assert.equal(
                    getParamFromTxEvent(txResult, 'outcomeTokenNetCost').valueOf(),
                    netCost.valueOf())
        }
    })
})
