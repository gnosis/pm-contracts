const utils = require('./utils')

const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const EventFactory = artifacts.require('EventFactory')
const OutcomeToken = artifacts.require('OutcomeToken')
const WETH9 = artifacts.require('WETH9')
const TellorOracle = artifacts.require('TellorOracle')
const TellorOracleFactory = artifacts.require('TellorOracleFactory')
const TellorFallbackOracle = artifacts.require('TellorOracle')
const TellorFallbackOracleFactory = artifacts.require('TellorOracleFactory')

//how do i get json instead...
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper

var fs = require('fs');
var jsonFileTellor = "Tellor.json";
var parsed= JSON.parse(fs.readFileSync(jsonFileTellor));
var TellorAbi = parsed.abi;


var jsonFileMaster = "TellorMaster.json";
var masterParsed= JSON.parse(fs.readFileSync(jsonFileMaster));
var TellorMasterAbi = masterParsed.abi;


contract('Event', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let ipfsHash, oracle, event
    let master
    let tellor1
    let masterOracle
    let tellor

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await WETH9.deployed()

        //web3.eth.contract(abi).new(param1,param2,{data:code}, callback);
        //tellor1 = await Tellor.new();
        tellor1 = await web3.eth.contract(TellorAbi).new();
        //masterOracle = await TellorMaster.new(tellor1.address);
        masterOracle = await web3.eth.contract(TellorMasterAbi).new(tellor1.address);
        master = await new web3.eth.Contract(masterAbi,masterOracle.address);
        tellor = await new web3.eth.Contract(tellorAbi,tellor1.address);


        // create event
        ipfsHash = web3.utils.utf8ToHex('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');//???
        oracle = await utils.getParamFromTxEvent(
            await TellorOracleFactory.createCentralizedOracle(ipfsHash),
            'tellorOracle', TellorOracle
        )
        event = await utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
            'categoricalEvent', CategoricalEvent
        )

        //start Mining so that a value can be entered
        console.log('START MINING RIG!!')
        var logMineWatcher = await promisifyLogWatch(master.address, 'NewValue(uint256,uint256,uint256,uint256,bytes32)')
        for(var i = 0;i < 5;i++){
           logMineWatcher = await promisifyLogWatch(master.address, 'NewValue(uint256,uint256,uint256,uint256,bytes32)')
           await web3.eth.sendTransaction({to: master.address,from:accounts[0],gas:7000000,data:tellor.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
        }

        res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data)
        assert(res[0] > 0, "value should be positive")

    })

    it('should buy, set and redeem outcomes for categorical event', async () => {
        // Buy all outcomes
        const buyer = 2
        const collateralTokenCount = 10
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
        await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        const outcomeToken1 = await OutcomeToken.at(await event.outcomeTokens.call(0))
        const outcomeToken2 = await OutcomeToken.at(await event.outcomeTokens.call(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        //Set outcome in oracle contract
        await oracle.setOutcome(1)
        assert.equal(await oracle.getOutcome.call(), 1)
        assert.equal(await oracle.isOutcomeSet.call(), true)

        //Set outcome in event
        await event.setOutcome()
        assert.equal(await event.outcome.call(), 1)
        assert.equal(await event.isOutcomeSet.call(),true)

        //Redeem winnings for buyer account
        const buyerWinnings = await utils.getParamFromTxEvent(
            await event.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })

    it('should buy, set, and redeem outcomes for scalar event', async () => {
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
})