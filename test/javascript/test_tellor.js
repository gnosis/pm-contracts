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
const TellorTransfer = require("usingtellor/build/contracts/TellorTransfer.json")
const TellorGettersLibrary = require("usingtellor/build/contracts/TellorGettersLibrary.json")
const TellorLibrary = require("usingtellor/build/contracts/TellorLibrary.json")


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
    let tellorTransfer
    let tellorGettersLibrary
    let tellorLibrary
    beforeEach(async () => {
        let t = await new web3.eth.Contract(TellorTransfer.abi)
        tellorTransfer  =await t.deploy({data:TellorTransfer.bytecode}).send({from:accounts[0], gas:3000000})
        console.log(tellorTransfer._address)
  
        t = await new web3.eth.Contract(TellorGettersLibrary.abi)
        tellorGettersLibrary  =await t.deploy({data:TellorGettersLibrary.bytecode}).send({from:accounts[0], gas:3000000})
        var libBytes = TellorLibrary.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        t = await new web3.eth.Contract(TellorLibrary.abi)
        tellorLibrary  =await t.deploy({data:libBytes}).send({from:accounts[0], gas:5000000})
        var mainBytes = Tellor.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        mainBytes = mainBytes.replace(
          /_+TellorLibrary_+/g,
          tellorLibrary._address.replace("0x", "")
        );

        t = await new web3.eth.Contract(Tellor.abi)
        tellor  =await t.deploy({data:mainBytes}).send({from:accounts[0], gas:5000000})
        console.log(tellor._address)


        var masterBytes = TellorMaster.bytecode.replace(
          /_+TellorGettersLibrary_+/g,
          tellorGettersLibrary._address.replace("0x", "")
        );
        masterBytes = masterBytes.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        t = await new web3.eth.Contract(TellorMaster.abi)
        master  =await t.deploy({data:masterBytes,arguments:[tellor._address]}).send({from:accounts[0], gas:4000000})
        console.log("finished with linked contracts")
        userContract = await new web3.eth.Contract(UserContract.abi)
        userContract = userContract.deploy({data:UserContract.bytecode,arguments:[master._address]})
        usingTellor = await new web3.eth.Contract(UsingTellor.abi)
        usingTellor = usingTellor.deploy({data:UsingTellor.bytecode,arguments:[userContract._address]})
        tellorOracle = await TellorOracle.new(tellor.options.address,1,_endDate)
        console.log("here")
        tellorFallbackOracle = await TellorFallbackOracle.new()
        tellorOracleFactory = TellorOracleFactory.new(tellorOracle)
        tellorFallbackOracleFactory = TellorFallbackOracleFactory.new(await TellorFallbackOracle.new(tellor.address,86400,1,_endDate,web3.utils.toWei('1',"ether")))
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
       assert.equal(await oracle.owner.call(), accounts[1],"set owner should work")
})
})