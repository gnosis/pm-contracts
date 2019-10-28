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


const TellorMaster = artifacts.require("@tellor-io/TellorCore/tree/master/contracts/TellorMaster.sol")
const Tellor = artifacts.require("@tellor-io/TellorCore/tree/master/contracts/Tellor.sol")
var tellorAbi = Tellor.abi;
var tellorMasterAbi = TellorMaster.abi;

const UserContract = artifacts.require("@tellor-io/TellorCore/tree/master/contracts/userFiles/UserContract.sol")
const UsingTellor = artifacts.require("@tellor-io/TellorCore/tree/master/contracts/userFiles/UsingTellor.sol")

//using json instead...too many linked libarries....
/*var fs = require('fs');
var jsonFileTellor = "Tellor.json";
var parsed= JSON.parse(fs.readFileSync(jsonFileTellor));
var tellorAbi = parsed.abi;


var jsonFileMaster = "TellorMaster.json";
var masterParsed= JSON.parse(fs.readFileSync(jsonFileMaster));
var tellorMasterAbi = masterParsed.abi;*/



contract('Event', function (accounts) {
    let centralizedOracleFactory
    let eventFactory
    let etherToken
    let ipfsHash, oracle, event
    let master
    let tellor1
    let masterOracle
    let tellor
    let userContract
    let usingTellor

    beforeEach(async () => {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        eventFactory = await EventFactory.deployed()
        etherToken = await WETH9.deployed()

        //web3.eth.contract(abi).new(param1,param2,{data:code}, callback);
        tellor1 = await Tellor.new();
        //The line below is for using the abi to deploy
        //tellor1 = await web3.eth.contract(tellorAbi).new();
        masterOracle = await TellorMaster.new(tellor1.address);
        //The line below is for using the abi to deploy
        //masterOracle = await web3.eth.contract(tellorMasterAbi).new(tellor1.address);
        master = await new web3.eth.Contract(tellorMasterAbi,masterOracle.address);
        tellor = await new web3.eth.Contract(tellorAbi,tellor1.address);
        userContract = await UserContract.new(master.address);
        usingTellor = await UsingTellor.new(userContract.address);

        // create event
        //what is the ipfsHash for?
        ipfsHash = web3.utils.utf8ToHex('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');//???
        oracle = await utils.getParamFromTxEvent(
            await TellorOracleFactory.createTellorOracle(ipfsHash),
            'tellorOracle', TellorOracle
        )

        let _date = new Date();
        let _endDate = ((_date - (_date % 86400000))/1000) + 86400;
//      console.log(_date,_endDate);

        await oracle.setTellorContract(userContract.address ,86400, 1, _endDate, 500);
        event = await utils.getParamFromTxEvent(
            await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
            'categoricalEvent', CategoricalEvent
        )

        //start Mining so that a value can be added to tellor
        // console.log('START MINING RIG!!')
        // var logMineWatcher = await promisifyLogWatch(master.address, 'NewValue(uint256,uint256,uint256,uint256,bytes32)')
        // for(var i = 0;i < 5;i++){
        //    logMineWatcher = await promisifyLogWatch(master.address, 'NewValue(uint256,uint256,uint256,uint256,bytes32)')
        //    await web3.eth.sendTransaction({to: master.address,from:accounts[0],gas:7000000,data:tellor.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
        // }

        // res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data)
        // assert(res[0] > 0, "value should be positive")

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
    
    // it('should buy, set and redeem outcomes for categorical event', async () => {
    //     // Buy all outcomes
    //     const buyer = 2
    //     const collateralTokenCount = 10
    //     await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
    //     assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

    //     await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
    //     await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
    //     assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
    //     assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

    //     const outcomeToken1 = await OutcomeToken.at(await event.outcomeTokens.call(0))
    //     const outcomeToken2 = await OutcomeToken.at(await event.outcomeTokens.call(1))
    //     assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
    //     assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

    //     //Set outcome in oracle contract
    //     await oracle.setOutcome(1)
    //     assert.equal(await oracle.getOutcome.call(), 1)
    //     assert.equal(await oracle.isOutcomeSet.call(), true)

    //     //Set outcome in event
    //     await event.setOutcome()
    //     assert.equal(await event.outcome.call(), 1)
    //     assert.equal(await event.isOutcomeSet.call(),true)

    //     //Redeem winnings for buyer account
    //     const buyerWinnings = await utils.getParamFromTxEvent(
    //         await event.redeemWinnings({ from: accounts[buyer] }), 'winnings')
    //     assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
    //     assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
    //     assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
    //     assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    // })


})