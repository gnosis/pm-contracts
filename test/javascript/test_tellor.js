const utils = require('./utils')

const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const EventFactory = artifacts.require('EventFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')
const TellorOracle = artifacts.require('TellorOracle')
const TellorOracleFactory = artifacts.require('TellorOracleFactory')
const TellorFallbackOracle = artifacts.require('TellorFallbackOracle')
const TellorFallbackOracleFactory = artifacts.require('TellorFallbackOracleFactory')


const TellorMaster = require("usingtellor/build/contracts/TellorMaster.json")
const Tellor = require("usingtellor/build/contracts/Tellor.json")

const UserContract = require("usingtellor/build/contracts/UserContract.json")
const UsingTellor = require("usingtellor/build/contracts/UsingTellor.json")
const Optimistic = require("usingtellor/build/contracts/Optimistic.json")


const ipfsHash = web3.utils.utf8ToHex('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
const _date = new Date();
const _endDate = ((_date - (_date % 86400000))/1000) + 86400;

contract('Event', function (accounts) {
    let eventFactory
    let etherToken
    let ipfsHash, oracle, event
    let master
    let tellor
    let userContract
    let usingTellor
    let tellorOracle
    let tellorFallbackOracle
    let tellorOracleFactory
    let tellorFallbackOracleFactory

    beforeEach(async () => {
        tellor = await new web3.eth.Contract(Tellor.abi)
        master = await new web3.eth.Contract(TellorMaster.abi,tellor.address)
        userContract = await new web3.eth.Contract(UserContract.abi,master.address)
        usingTellor = await new web3.eth.Contract(UsingTellor.abi,userContract.address)
        tellorOracle = await TellorOracle.new(tellor.address)
        tellorFallbackOracle = await TellorFallbackOracle.new()
        tellorOracleFactory = TellorOracleFactory.new(await TellorOracle.new())
        tellorFallbackOracleFactory = TellorFallbackOracleFactory.new(await TellorFallbackOracle.new())
        eventFactory = await EventFactory.deployed()
        etherToken = await WETH9.deployed()
    })
    it('Test outcomes for Tellor Contract', async () => {
        oracle = await utils.getParamFromTxEvent(
            await TellorOracleFactory.createTellorOracle(ipfsHash),
            'tellorOracle', TellorOracle
        )
         await oracle.setTellorContract(userContract.address ,86400, 1, _endDate, 500);
        const scalarEvent = await utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', ScalarEvent
        )
        // Buy all outcomes
        const buyer = 3
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        //Set outcome in oracle contract
        await oracle.setOutcome(0)
        assert.equal(await oracle.getOutcome.call(), 0)
        assert.equal(await oracle.isOutcomeSet.call(), true)

        //Set outcome in event
        await scalarEvent.setOutcome()
        assert.equal(await scalarEvent.outcome.call(), 0)
        assert.equal(await scalarEvent.isOutcomeSet.call(), true)

        //Redeem winnings for buyer account
        const buyerWinnings = await utils.getParamFromTxEvent(
            await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })
    it('Test outcomes for Tellor Fallback Contract', async () => {
        oracle = await utils.getParamFromTxEvent(
            await TellorFallbackOracleFactory.createTellorFallbackOracle(ipfsHash),
            'tellorOracle', TellorOracle
        )
         await oracle.setTellorContract(userContract.address ,86400, 1, _endDate, 500);
        const scalarEvent = await utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', ScalarEvent
        )
        // Buy all outcomes
        const buyer = 3
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        //Set outcome in oracle contract
        await oracle.setOutcome(0)
        assert.equal(await oracle.getOutcome.call(), 0)
        assert.equal(await oracle.isOutcomeSet.call(), true)

        //Set outcome in event
        await scalarEvent.setOutcome()
        assert.equal(await scalarEvent.outcome.call(), 0)
        assert.equal(await scalarEvent.isOutcomeSet.call(), true)

        //Redeem winnings for buyer account
        const buyerWinnings = await utils.getParamFromTxEvent(
            await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })
    it('Test outcomes for Tellor Fallback Contract w/Dispute', async () => {
        oracle = await utils.getParamFromTxEvent(
            await TellorFallbackOracleFactory.createTellorFallbackOracle(ipfsHash),
            'tellorOracle', TellorOracle
        )
         await oracle.setTellorContract(userContract.address ,86400, 1, _endDate, 500);
        const scalarEvent = await utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', ScalarEvent
        )
        // Buy all outcomes
        const buyer = 3
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        //Set outcome in oracle contract
        await oracle.setOutcome(0)
        assert.equal(await oracle.getOutcome.call(), 0)
        assert.equal(await oracle.isOutcomeSet.call(), true)

        await oracle.dispute()


        await oracle.setTellorOutcome(0)
        assert.equal(await oracle.getOutcome.call(), 0)
        assert.equal(await oracle.isOutcomeSet.call(), true)


        //Set outcome in event
        await scalarEvent.setOutcome()
        assert.equal(await scalarEvent.outcome.call(), 0)
        assert.equal(await scalarEvent.isOutcomeSet.call(), true)

        //Redeem winnings for buyer account
        const buyerWinnings = await utils.getParamFromTxEvent(
        await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
       //functions to test
       await oracle.replaceOwner(accounts[1])
       assert.equal(await oracle.owner.call(), accounts[1])
})
})