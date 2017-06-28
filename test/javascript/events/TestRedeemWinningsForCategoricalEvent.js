const utils = require('../../utils')

const Event = artifacts.require('Event')
const EventFactory = artifacts.require('EventFactory')
const Token = artifacts.require('Token')
const EtherToken = artifacts.require('EtherToken')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')

contract('event', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await EtherToken.deployed()
    })

    it('should buy, set and redeem outcomes for categorical event', async () => {
        // create event
        const ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        const oracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )
        const event = utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
            'categoricalEvent', Event
        )

        // Buy all outcomes
        const buyer = 0
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)
        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), 0)
        const outcomeToken1 = Token.at(await event.outcomeTokens(0))
        const outcomeToken2 = Token.at(await event.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), collateralTokenCount)

        //Set outcome in oracle contract
        await oracle.setOutcome(1)
        assert.equal(await oracle.getOutcome(), 1)
        assert.equal(await oracle.isOutcomeSet(), true)

        //Set outcome in event
        await event.setOutcome()
        assert.equal(await event.outcome(), 1)
        assert.equal(await event.isOutcomeSet(),true)

        //Redeem winnings for buyer account
        await event.redeemWinnings({ from: accounts[buyer] })
        // assert.equal(await event.redeemWinnings({ from: accounts[buyer] }), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf(accounts[buyer]), collateralTokenCount)
    })
})
