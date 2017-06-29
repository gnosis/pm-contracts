const utils = require('./utils')

const Event = artifacts.require('Event')
const EventFactory = artifacts.require('EventFactory')
const Token = artifacts.require('Token')
const EtherToken = artifacts.require('EtherToken')
const Oracle = artifacts.require('Oracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const Market = artifacts.require('Market')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')

contract('markets', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let standardMarketFactory
    let lmsrMarketMaker
    let ipfsHash, oracle, event

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await EtherToken.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed()

        // create event
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        oracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', Oracle
        )
        event = utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
            'categoricalEvent', Event
        )
    })

    it('should allow buying and selling', async () => {
        // create market
        const feeFactor = 50000  // 5%
        const market = utils.getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor),
            'market', Market
        )

        // Fund market
        const investor = 0
        const funding = 1e18

        await etherToken.deposit({ value: funding, from: accounts[investor] })
        assert.equal(await etherToken.balanceOf(accounts[investor]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[investor] })

        await market.fund(funding, { from: accounts[investor] })
        assert.equal(await etherToken.balanceOf(accounts[investor]), 0)

        // Buy outcome tokens
        const buyer = 1
        const outcome = 0
        const token_count = 1e15
        const outcome_token_cost = await lmsrMarketMaker.calcCost(market.address, outcome, token_count)

        let fee = await market.calcMarketFee(outcome_token_cost)
        assert.equal(fee, Math.floor(outcome_token_cost * 5 / 100))

        const cost = fee.add(outcome_token_cost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), cost.valueOf())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(utils.getParamFromTxEvent(
            await market.buy(outcome, token_count, cost, { from: accounts[buyer] }), 'cost'
        ), cost.valueOf())

        const outcome_token = Token.at(await event.outcomeTokens(outcome))
        assert.equal(await outcome_token.balanceOf(accounts[buyer]), token_count)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), 0)

        // Sell outcome tokens
        const outcome_token_profit = await lmsrMarketMaker.calcProfit(market.address, outcome, token_count)
        fee = await market.calcMarketFee(outcome_token_profit)
        const profit = outcome_token_profit.sub(fee)

        await outcome_token.approve(market.address, token_count, { from: accounts[buyer] })
        assert.equal(utils.getParamFromTxEvent(
            await market.sell(outcome, token_count, profit, { from: accounts[buyer] }), 'profit'
        ), profit.valueOf())

        assert.equal(await outcome_token.balanceOf(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), profit.valueOf())
    })

    // it('should support a campaign', async () => {

    //     // # Create campaign
    //     // fee = 50000  # 5%
    //     // funding = 10**18
    //     // deadline = self.s.block.timestamp + 60*60  # in 1h
    //     // campaign = self.contract_at(self.campaign_factory.createCampaigns(event.address, self.market_factory.address,
    //     //                                                                   self.lmsr.address, fee, funding, deadline),
    //     //                             self.campaign_abi)
    //     // self.assertEqual(campaign.stage(), 0)
    //     // # Fund campaign
    //     // backer_1 = 0
    //     // amount = 10**18 // 4 * 3
    //     // self.ether_token.deposit(value=amount, sender=keys[backer_1])
    //     // self.ether_token.approve(campaign.address, amount, sender=keys[backer_1])
    //     // campaign.fund(amount, sender=keys[backer_1])
    //     // self.assertEqual(campaign.stage(), 0)
    //     // backer_2 = 1
    //     // amount = 10 ** 18 // 4
    //     // self.ether_token.deposit(value=amount, sender=keys[backer_2])
    //     // self.ether_token.approve(campaign.address, amount, sender=keys[backer_2])
    //     // campaign.fund(amount, sender=keys[backer_2])
    //     // self.assertEqual(campaign.stage(), 1)
    //     // # Create market
    //     // market = self.contract_at(campaign.createMarket(), self.market_abi)
    //     // # Trade
    //     // buyer = 2
    //     // outcome = 0
    //     // token_count = 10 ** 15
    //     // outcome_token_cost = self.lmsr.calcCost(market.address, outcome, token_count)
    //     // fee = market.calcMarketFee(outcome_token_cost)
    //     // self.assertEqual(fee, outcome_token_cost * 105 // 100 - outcome_token_cost)
    //     // cost = outcome_token_cost + fee
    //     // self.ether_token.deposit(value=cost, sender=keys[buyer])
    //     // self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), cost)
    //     // self.ether_token.approve(market.address, cost, sender=keys[buyer])
    //     // self.assertEqual(market.buy(outcome, token_count, cost, sender=keys[buyer]), cost)
    //     // # Set outcome
    //     // oracle.setOutcome(1)
    //     // event.setOutcome()
    //     // # Withdraw fees
    //     // campaign.closeMarket()
    //     // final_balance = campaign.finalBalance()
    //     // self.assertGreater(final_balance, funding)
    //     // self.assertEqual(campaign.withdrawFees(sender=keys[backer_1]) // 100, final_balance // 4 * 3 // 100)
    //     // self.assertEqual(campaign.withdrawFees(sender=keys[backer_2]) // 100, final_balance // 4 // 100)
    //     // # Withdraw works only once
    //     // self.assertEqual(campaign.withdrawFees(sender=keys[backer_1]), 0)
    //     // self.assertEqual(campaign.withdrawFees(sender=keys[backer_2]), 0)

    // })

    it('can be created and closed', async () => {
        // Create market
        const feeFactor = 0
        const market = utils.getParamFromTxEvent(
            await standardMarketFactory.createMarket(event.address, lmsrMarketMaker.address, feeFactor),
            'market', Market
        )

        // Fund market
        const buyer = 0
        const funding = 100

        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding)

        await etherToken.approve(market.address, funding, { from: accounts[buyer] })
        await market.fund(funding, { from: accounts[buyer] })

        // Market can only be funded once
        await etherToken.deposit({ value: funding, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding)
        await etherToken.approve(market.address, funding, { from: accounts[buyer] })

        // self.assertRaises(TransactionFailed, market.fund, funding, { from: accounts[buyer] })

        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding)

        // # Close market
        await market.close({ from: accounts[buyer] })
        // # Market can only be closed once
        // self.assertRaises(TransactionFailed, market.close, { from: accounts[buyer] })

        // # Sell all outcomes
        await event.sellAllOutcomes(funding, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), funding * 2)
    })
})
