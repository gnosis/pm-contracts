const _ = require('lodash')
const { wait } = require('./digix_tempo')(web3)

const BigNumber = require('bignumber.js')
const utils = require('./utils')
const { getBlock, getParamFromTxEvent, assertRejects, randrange, randnums } = utils

const CategoricalEvent = artifacts.require('CategoricalEvent')
const EventFactory = artifacts.require('EventFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const StandardMarket = artifacts.require('StandardMarket')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const Campaign = artifacts.require('Campaign')
const CampaignFactory = artifacts.require('CampaignFactory')


contract('StandardMarket', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let standardMarketFactory
    let lmsrMarketMaker
    let campaignFactory
    let ipfsHash, centralizedOracle, event
    const numOutcomes = 3
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await WETH9.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed.call()
        campaignFactory = await CampaignFactory.deployed()

        // create event
        ipfsHash = web3.utils.utf8ToHex('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
        centralizedOracle = await getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )
        event = await getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, centralizedOracle.address, numOutcomes),
            'categoricalEvent', CategoricalEvent
        )
    })

    it('can be created and closed', async () => {
        // Create market
        const buyer = 5

        const feeFactor = 0
        const market = await getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[buyer] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 100

        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[buyer] })
        await market.fund(funding, { from: accounts[buyer] })

        // StandardMarket can only be funded once
        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)
        await etherToken.approve(market.address, funding, { from: accounts[buyer] })
        await assertRejects(market.fund(funding, { from: accounts[buyer] }), 'market funded twice')

        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding)

        // Close market
        await market.close({ from: accounts[buyer] })

        // StandardMarket can only be closed once
        await assertRejects(market.close({ from: accounts[buyer] }), 'market closed twice')

        // Sell all outcomes
        await event.sellAllOutcomes(funding, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding * 2)
    })

    it('should allow buying and selling (legacy)', async () => {
        // create market
        const investor = 0

        const feeFactor = 50000  // 5%
        const market = await getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 1e18.toString()

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })

        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Buy outcome tokens
        const buyer = 1
        const outcome = 0
        const tokenCount = 1e15
        const outcomeTokenCost = await lmsrMarketMaker.calcCost.call(market.address, outcome, tokenCount)

        let fee = await market.calcMarketFee.call(outcomeTokenCost)
        assert.equal(fee, Math.floor(outcomeTokenCost * 5 / 100))

        const cost = fee.add(outcomeTokenCost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.toString())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(await getParamFromTxEvent(
            await market.buy(outcome, tokenCount, cost, { from: accounts[buyer] }), 'outcomeTokenCost'
        ), outcomeTokenCost.toString())

        const outcomeToken = await OutcomeToken.at(await event.outcomeTokens.call(outcome))
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        // Sell outcome tokens
        const outcomeTokenProfit = await lmsrMarketMaker.calcProfit.call(market.address, outcome, tokenCount)
        fee = await market.calcMarketFee.call(outcomeTokenProfit)
        const profit = outcomeTokenProfit.sub(fee)

        await outcomeToken.approve(market.address, tokenCount, { from: accounts[buyer] })
        assert.equal(await getParamFromTxEvent(
            await market.sell(outcome, tokenCount, profit, { from: accounts[buyer] }), 'outcomeTokenProfit'
        ).valueOf(), outcomeTokenProfit.toString())

        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), profit.toString())
        await etherToken.transfer(ZERO_ADDRESS, profit, { from: accounts[buyer] })
    })

    it('should allow short selling (legacy)', async () => {
        // create market
        const investor = 7

        const feeFactor = 50000  // 5%
        const market = await getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 1e18.toString()

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal((await etherToken.balanceOf.call(accounts[investor])).valueOf(), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })

        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Short sell outcome tokens
        const buyer = 7
        const outcome = 0
        const oppositeOutcome = 1
        const tokenCount = 1e15
        const outcomeTokenProfit = await lmsrMarketMaker.calcProfit.call(market.address, outcome, tokenCount)
        const fee = await market.calcMarketFee.call(outcomeTokenProfit)
        const cost = fee.add(web3.utils.toBN(tokenCount)).sub(outcomeTokenProfit)

        await etherToken.deposit({ value: tokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), tokenCount.toString())
        await etherToken.approve(market.address, tokenCount.toString(), { from: accounts[buyer] })

        assert.equal(
            await getParamFromTxEvent(
                await market.shortSell(outcome, tokenCount.toString(), outcomeTokenProfit - fee, { from: accounts[buyer] }),
                'cost', null, 'OutcomeTokenShortSale'
            ).valueOf(), cost.toString())
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), (tokenCount - cost).toString())
        await etherToken.transfer(ZERO_ADDRESS, (tokenCount - cost).toString(), { from: accounts[buyer] })
        const outcomeToken = await OutcomeToken.at(await event.outcomeTokens.call(oppositeOutcome))
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount.toString())
    })

    it('should be created by a successful campaign (legacy)', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18.toString()
        const deadline = (await web3.eth.getBlock('latest')).timestamp + 60  // in 1h
        const campaign = await Campaign.at(await getParamFromTxEvent(
            await campaignFactory.createCampaign(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding,
                deadline), 'campaign'))
        assert.equal(await campaign.stage.call(), 0)

        // Fund campaign
        const backer1 = 2
        let amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer1] })
        await etherToken.approve(campaign.address, amount.toString(), { from: accounts[backer1] })
        await campaign.fund(amount.toString(), { from: accounts[backer1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        const backer2 = 3
        amount = 2.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer2] })
        await etherToken.approve(campaign.address, amount.toString(), { from: accounts[backer2] })
        campaign.fund(amount.toString(), { from: accounts[backer2] })
        assert.equal(await campaign.stage.call(), 1)

        // Create market
        const market = await StandardMarket.at(await getParamFromTxEvent(await campaign.createMarket(), 'market'))

        // Trade
        const buyer = 4
        const outcome = 0
        const tokenCount = 1e15
        const outcomeTokenCost = await lmsrMarketMaker.calcCost.call(market.address, outcome, tokenCount)

        const fee = await market.calcMarketFee.call(outcomeTokenCost)
        assert.equal(fee.valueOf(), new BigNumber(outcomeTokenCost).times(.05).integerValue(BigNumber.ROUND_FLOOR).toString())

        const cost = outcomeTokenCost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf.call(accounts[buyer])).valueOf(), cost.toString())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(await getParamFromTxEvent(
            await market.buy(outcome, tokenCount.toString(), cost, { from: accounts[buyer] }), 'outcomeTokenCost').valueOf()
        , outcomeTokenCost.toString())

        // Set outcome
        await centralizedOracle.setOutcome(1)
        await event.setOutcome()

        // Withdraw fees
        await campaign.closeMarket()
        const finalBalance = await campaign.finalBalance()

        assert(finalBalance.gt(funding))

        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer1] }),
                'fees'
            ).valueOf(), BigNumber(finalBalance).times(.75).integerValue(BigNumber.ROUND_FLOOR).toString())
        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer2] }),
                'fees'
            ).valueOf(), BigNumber(finalBalance).times(.25).integerValue(BigNumber.ROUND_FLOOR).toString())

        // Withdraw works only once
        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer1] }),
                'fees'
            ).valueOf(), 0)
        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer2] }),
                'fees'
            ).valueOf(), 0)
    })

    it('should not be created by an unsuccessful campaign (legacy)', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18
        const deadline = (await web3.eth.getBlock('latest')).timestamp + 60  // in 1h
        const campaign = await Campaign.at(await getParamFromTxEvent(
            await campaignFactory.createCampaign(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding.toString(),
                deadline), 'campaign'))
        assert.equal(await campaign.stage.call(), 0)

        // Fund campaign
        const backer1 = 8
        const amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer1] })
        await etherToken.approve(campaign.address, amount.toString(), { from: accounts[backer1] })
        await campaign.fund(amount.toString(), { from: accounts[backer1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        // Deadline passes
        await wait(61)
        assert.equal(
            await getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer1] }), 'refund'),
            amount)
        assert.equal(
            await getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer1] }), 'refund'),
            0)
    })

    it('should allow buying and selling', async () => {
        // create market
        const investor = 0

        const feeFactor = 50000  // 5%
        const market = await getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), funding.toString())

        await etherToken.approve(market.address, funding.toString(), { from: accounts[investor] })

        await market.fund(funding.toString(), { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Buy outcome tokens
        const buyer = 1
        const outcome = 0
        const tokenCount = 1e15
        let outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)

        let fee = await market.calcMarketFee.call(outcomeTokenCost)
        assert.equal(fee, Math.floor(outcomeTokenCost * 5 / 100))

        const cost = fee.add(outcomeTokenCost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf.call(accounts[buyer])).valueOf(), cost.toString())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(await getParamFromTxEvent(
            await market.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        ), outcomeTokenCost.toString())

        const outcomeToken = await OutcomeToken.at(await event.outcomeTokens.call(outcome))
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount.toString())
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        // Sell outcome tokens
        outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? -tokenCount : 0)
        const outcomeTokenProfit = (await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)).neg()
        fee = await market.calcMarketFee.call(outcomeTokenProfit)
        const profit = outcomeTokenProfit.sub(fee)

        await outcomeToken.approve(market.address, tokenCount.toString(), { from: accounts[buyer] })
        assert.equal((await getParamFromTxEvent(
            await market.trade(outcomeTokenAmounts, -profit, { from: accounts[buyer] }), 'outcomeTokenNetCost'
        )).neg().valueOf(), outcomeTokenProfit.toString())

        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), profit.toString())
    })

    it('should allow short selling', async () => {
        // create market
        const investor = 7

        const feeFactor = 50000  // 5%
        const market = await getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[investor] }),
            'market', StandardMarket
        )

        // Fund market
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal((await etherToken.balanceOf.call(accounts[investor])).valueOf(), funding.toString())

        await etherToken.approve(market.address, funding.toString(), { from: accounts[investor] })

        await market.fund(funding.toString(), { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf.call(accounts[investor]), 0)

        // Short sell outcome tokens
        const buyer = 7
        const outcome = 0
        const differentOutcome = 1
        const tokenCount = 1e15
        const outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i !== outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)
        const fee = await market.calcMarketFee.call(outcomeTokenCost)
        const cost = outcomeTokenCost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), cost.toString())
        await etherToken.approve(market.address, cost, { from: accounts[buyer] })

        assert.equal(
            await getParamFromTxEvent(
                await market.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }),
                'outcomeTokenNetCost'
            ).valueOf(), outcomeTokenCost.toString())
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)
        const outcomeToken = await OutcomeToken.at(await event.outcomeTokens.call(differentOutcome))
        assert.equal(await outcomeToken.balanceOf.call(accounts[buyer]), tokenCount)
    })

    it('should be created by a successful campaign', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18
        const deadline = (await getBlock('latest')).timestamp + 60  // in 1h
        const campaign = await Campaign.at(await getParamFromTxEvent(
            await campaignFactory.createCampaign(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding.toString(),
                deadline), 'campaign'))
        assert.equal(await campaign.stage.call(), 0)

        // Fund campaign
        const backer1 = 2
        let amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer1] })
        await etherToken.approve(campaign.address, amount.toString(), { from: accounts[backer1] })
        await campaign.fund(amount.toString(), { from: accounts[backer1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        const backer2 = 3
        amount = 2.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer2] })
        await etherToken.approve(campaign.address, amount.toString(), { from: accounts[backer2] })
        campaign.fund(amount.toString(), { from: accounts[backer2] })
        assert.equal(await campaign.stage.call(), 1)

        // Create market
        const market = await StandardMarket.at(await getParamFromTxEvent(await campaign.createMarket(), 'market'))

        // Trade
        const buyer = 4
        const outcome = 0
        const tokenCount = 1e15
        const outcomeTokenAmounts = Array.from({length: numOutcomes}, (v, i) => i === outcome ? tokenCount : 0)
        const outcomeTokenCost = await lmsrMarketMaker.calcNetCost.call(market.address, outcomeTokenAmounts)

        const fee = await market.calcMarketFee.call(outcomeTokenCost)        
        assert.equal(fee.valueOf(), new BigNumber(outcomeTokenCost).times(.05).integerValue(BigNumber.ROUND_FLOOR).toString())

        const cost = outcomeTokenCost.add(fee)

        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal((await etherToken.balanceOf.call(accounts[buyer])).valueOf(), cost.toString())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(await getParamFromTxEvent(
            await market.trade(outcomeTokenAmounts, cost, { from: accounts[buyer] }), 'outcomeTokenNetCost').valueOf()
        , outcomeTokenCost.toString())

        // Set outcome
        await centralizedOracle.setOutcome(1)
        await event.setOutcome()

        // Withdraw fees
        await campaign.closeMarket()
        const finalBalance = await campaign.finalBalance()

        assert(finalBalance.gt(funding))

        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer1] }),
                'fees'
            ).valueOf(), new BigNumber(finalBalance).times(.75).integerValue(BigNumber.ROUND_FLOOR).toString())
        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer2] }),
                'fees'
            ).valueOf(), new BigNumber(finalBalance).times(.25).integerValue(BigNumber.ROUND_FLOOR).toString())

        // Withdraw works only once
        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer1] }),
                'fees'
            ).valueOf(), 0)
        assert.equal(
            await getParamFromTxEvent(
                await campaign.withdrawFees({ from: accounts[backer2] }),
                'fees'
            ).valueOf(), 0)
    })

    it('should not be created by an unsuccessful campaign', async () => {
        // Create campaign
        const feeFactor = 50000  // 5%
        const funding = 1e18
        const deadline = (await getBlock('latest')).timestamp + 60  // in 1h
        const campaign = await Campaign.at(await getParamFromTxEvent(
            await campaignFactory.createCampaign(
                event.address,
                standardMarketFactory.address,
                lmsrMarketMaker.address,
                feeFactor,
                funding.toString(),
                deadline), 'campaign'))
        assert.equal(await campaign.stage.call(), 0)

        // Fund campaign
        const backer1 = 8
        const amount = 7.5e17

        await etherToken.deposit({ value: amount, from: accounts[backer1] })
        await etherToken.approve(campaign.address, amount.toString(), { from: accounts[backer1] })
        await campaign.fund(amount.toString(), { from: accounts[backer1] })
        assert.equal((await campaign.stage()).valueOf(), 0)

        // Deadline passes
        await wait(61)
        assert.equal(
            await getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer1] }), 'refund'),
            amount.toString())
        assert.equal(
            await getParamFromTxEvent(
                await campaign.refund({ from: accounts[backer1] }), 'refund'),
            0)
    })

    it('trading stress testing', async () => {
        const MAX_VALUE = web3.utils.toBN(new BigNumber(2).pow(256).minus(1))

        const trader = 9
        const feeFactor = 0

        const market = await getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor, { from: accounts[trader] }),
            'market', StandardMarket
        )

        // Get ready for trading
        await etherToken.deposit({ value: 2e19, from: accounts[trader] })
        await etherToken.approve(event.address, 1e19.toString(), { from: accounts[trader] })
        await event.buyAllOutcomes(1e19.toString(), { from: accounts[trader] })

        // Allow all trading
        const outcomeTokens = await Promise.all((await Promise.all(
            _.range(numOutcomes).map(i => event.outcomeTokens.call(i))
        )).map(OutcomeToken.at))

        await etherToken.approve(market.address, MAX_VALUE.toString(), { from: accounts[trader] })
        await Promise.all(outcomeTokens.map(outcomeToken =>
            outcomeToken.approve(market.address, MAX_VALUE.toString(), { from: accounts[trader] })))

        // Fund market
        const funding = 1e16
        await market.fund(funding.toString(), { from: accounts[trader] })

        for(let i = 0; i < 10; i++) {
            const outcome = Math.floor(numOutcomes * Math.random())
            const tokenCount = randrange(0, 1e16).valueOf()
            const outcomeTokenAmounts = randnums(-1e16, 1e16, numOutcomes).map(n => n.valueOf())
            const randParam = Math.random()
            const [method, forWhat] = randParam < (1/3) ? ['buy', 'Cost'] :
                randParam < (2/3) ? ['sell', 'Profit'] :
                ['trade', 'NetCost']
            const limit = await lmsrMarketMaker['calc' + forWhat]
                .call(...(method == 'trade' ?
                    [market.address, outcomeTokenAmounts]
                    : [market.address, outcome, tokenCount]))

            const marketOutcomeTokenCounts = await Promise.all(outcomeTokens.map(outcomeToken =>
                outcomeToken.balanceOf.call(market.address)))

            const marketCollateralTokenCount = await etherToken.balanceOf.call(market.address)

            if(method == 'buy') {
                const marketOutcomeTokenCount = marketOutcomeTokenCounts[outcome]
                assert(marketOutcomeTokenCount.add(limit).gte(tokenCount),
                    `trade ${i}: ${marketOutcomeTokenCount} + ${limit} < ${tokenCount}`)
            } else if(method == 'sell') {
                const newAmounts = marketOutcomeTokenCounts.slice()
                newAmounts[outcome] = BigNumber(newAmounts[outcome]).plus(tokenCount)
                const marketOutcomeSetAmount = BigNumber.min.apply(0, newAmounts)
                assert(marketOutcomeSetAmount.plus(marketCollateralTokenCount).gte(limit),
                    `trade ${i}: ${marketOutcomeSetAmount} + ${marketCollateralTokenCount} < ${limit}`)
            }

            let txResult;
            try {
                if(method == 'trade')
                    txResult = await market[method](outcomeTokenAmounts, limit, { from: accounts[trader] })
                else
                    txResult = await market[method](outcome, tokenCount, limit, { from: accounts[trader] })
            } catch(e) {
                throw new Error(`trade ${ i } (a ${
                    method
                } of ${
                    method == 'trade' ?
                        outcomeTokenAmounts
                        : `${
                            tokenCount
                        } of outcome ${
                            outcome
                        }`
                } with limit ${
                    limit
                }) failed while market has:\n\n${
                    marketOutcomeTokenCounts.map(c => c.valueOf()).join('\n')
                }\n\nand ${
                    marketCollateralTokenCount.valueOf()
                }: ${
                    e.message
                }`)
            }

            if(txResult)
                assert.equal(
                    await getParamFromTxEvent(txResult, 'outcomeToken' + forWhat).valueOf(),
                    limit.toString())
        }
    })
})
