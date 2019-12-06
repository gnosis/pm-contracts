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

const _date = new Date();
const buyer = 3
const collateralTokenCount = 10
let calls = 0

contract('Tellor', function (accounts) {
    let eventFactory
    let etherToken
    let oracle, event, _endDate
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
    let scalarEvent

    beforeEach(async () => {
        _endDate = ((_date - (_date % 86400000))/1000) + 86400 + (86400 * 4 * calls);
        calls = calls + 1
        /**********Start: Manually Deploy Tellor*******************************/
        //Deploy TellorTransfer library
        let t = await new web3.eth.Contract(TellorTransfer.abi)
        tellorTransfer  =await t.deploy({data:TellorTransfer.bytecode}).send({from:accounts[0], gas:3000000})  
        t = await new web3.eth.Contract(TellorGettersLibrary.abi)
        //Deploy TellorGetters library
        tellorGettersLibrary  =await t.deploy({data:TellorGettersLibrary.bytecode}).send({from:accounts[0], gas:3000000})
        //Link TellorLibary to TellorTransfer
        var libBytes = TellorLibrary.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        //Deploy TellorLibary
        t = await new web3.eth.Contract(TellorLibrary.abi)
        tellorLibrary  =await t.deploy({data:libBytes}).send({from:accounts[0], gas:5000000})
        //Link Tellor to TellorTranfer
        var mainBytes = Tellor.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        //Link Tellor to TellorLibrary 
        mainBytes = mainBytes.replace(
          /_+TellorLibrary_+/g,
          tellorLibrary._address.replace("0x", "")
        );
        //Deploy Tellor
        t = await new web3.eth.Contract(Tellor.abi)
        tellor  =await t.deploy({data:mainBytes}).send({from:accounts[0], gas:5000000})
        //Link TellorMaster to TellorGettersLibrary
        var masterBytes = TellorMaster.bytecode.replace(
          /_+TellorGettersLibrary_+/g,
          tellorGettersLibrary._address.replace("0x", "")
        );
        //Link TellorMaster to TellorTransfer library
        masterBytes = masterBytes.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        //Deploy TellorMaster
        t = await new web3.eth.Contract(TellorMaster.abi)
        master  =await t.deploy({data:masterBytes,arguments:[tellor._address]}).send({from:accounts[0], gas:4000000})
        /**********End: Manually Deploy Tellor*******************************/

        userContract = await new web3.eth.Contract(UserContract.abi)
        userContract = await userContract.deploy({data:UserContract.bytecode,arguments:[master._address]}).send({from:accounts[0], gas:4000000})
        usingTellor = await new web3.eth.Contract(UsingTellor.abi)
        usingTellor = await usingTellor.deploy({data:UsingTellor.bytecode,arguments:[userContract._address]}).send({from:accounts[0], gas:4000000})
        
        tellorOracle = await TellorOracle.new(userContract._address,1,_endDate)
        tellorFallbackOracle = await TellorFallbackOracle.new(userContract._address,86400,1,_endDate,web3.utils.toWei('1','ether'))
        tellorOracleFactory = await TellorOracleFactory.new(tellorOracle.address)
        tellorFallbackOracleFactory = await TellorFallbackOracleFactory.new(tellorFallbackOracle.address)
        eventFactory = await EventFactory.new(CategoricalEvent.address, ScalarEvent.address, OutcomeToken.address)
        etherToken = await WETH9.new()
        await web3.eth.sendTransaction({to:master._address,from:accounts[0],gas:2000000,data:tellor.methods.requestData("1","1",10000,0).encodeABI()})      
        
    })
    it('Test outcomes for Tellor Contract', async () => {
        //Create Tellor Oracle
        oracle = await utils.getParamFromTxEvent(
            await tellorOracleFactory.createTellorOracle(userContract._address,1,_endDate),
            'tellorOracle', TellorOracle
        )

        //create scalar event
        scalarEvent = await utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', ScalarEvent
        )

        //Collaterize outcomes-create both outcomes
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

        //Approve the scalarEvent contract to sell the outcomes
        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })

        //Buy all outcomes
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        //Create outcome tokens short/long 
        const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)
        utils.advanceTime(86400*2)

        //Tellor mines the data requested
        for(var i =1;i<6;i++){

            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:3000000,data:tellor.methods.submitMiningSolution("1",1,100).encodeABI()})      
        }
        //Ensure outcome has not been set yet
        assert.equal(await oracle.isOutcomeSet.call(), false)
        utils.advanceTime(86400*2)

        //Call setOutcome from the oracle after the contract expired and ensure it was set
        await oracle.setOutcome()
        assert.equal(await oracle.getOutcome.call(), 100)
        assert.equal(await oracle.isOutcomeSet.call(), true)

        //Set outcome in event
        await scalarEvent.setOutcome()
        assert.equal(await scalarEvent.outcome.call(), 100)
        assert.equal(await scalarEvent.isOutcomeSet.call(), true)

        //Redeem winnings for buyer account
        const buyerWinnings = await utils.getParamFromTxEvent(
            //pays out party/parties holding the winning outcome tokens
            await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
    })
    it('Test outcomes for Tellor Fallback Contract', async () => {
        //Create Fallback Tellor Oracle
        oracle = await utils.getParamFromTxEvent(
            await tellorFallbackOracleFactory.createTellorFallbackOracle(userContract._address,86400,1,_endDate,web3.utils.toWei('1','ether')),
            'tellorFallbackOracle', TellorFallbackOracle
        )

        //create scalar event
        scalarEvent = await utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', ScalarEvent
        )

        //Collaterize outcomes-create both outcomes
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]) - collateralTokenCount, 0)
        
        //Approve the scalarEvent contract to sell the outcomes
        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        
        //Buy all outcomes
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        //Create outcome tokens short/long 
        const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)
        utils.advanceTime(86400*2)

        //Tellor mines the data requested
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,500).encodeABI()})      
        }
        //Set outcome in oracle contract as zero--is the fallback supposed ot allow zero value?
        await oracle.setOutcome(0)
        assert.equal(await oracle.getOutcome.call(), 0)
        utils.advanceTime(86400*2)
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
        //Create Fallback Tellor Oracle
        oracle = await utils.getParamFromTxEvent(
            await tellorFallbackOracleFactory.createTellorFallbackOracle(userContract._address,86400,1,_endDate,web3.utils.toWei('1','ether')),
            'tellorFallbackOracle', TellorFallbackOracle
        )

        //create scalar event
        scalarEvent = await utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', ScalarEvent
        )

        //Collaterize outcomes-create both outcomes
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]) - collateralTokenCount,0)

        //Approve the scalarEvent contract to sell the outcomes
        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        
        //Buy all outcomes
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        //Create outcome tokens short/long
        const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        //Set outcome to zero in oracle contract
        await oracle.setOutcome(0)
        assert.equal(await oracle.getOutcome.call(), 0)
        //Ensure the outcome value has not been finalized yet
        assert.equal(await oracle.isOutcomeSet.call(), false)
        
        //Initiate dispute of oracle value, the value now will fall back to Tellor's value
        await oracle.dispute({value:web3.utils.toWei('1','ether')})
        utils.advanceTime(86400*2)

        //Tellor mines the data requested
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,100).encodeABI()})      
        }
        utils.advanceTime(86400*2)
        //Set Tellor outcome
        await oracle.setTellorOutcome()
        assert.equal(await oracle.getOutcome.call(), 100)
        assert.equal(await oracle.isOutcomeSet.call(), true)

        //Set outcome in event based on Tellor's value
        await scalarEvent.setOutcome()
        assert.equal(await scalarEvent.outcome.call(), 100)
        assert.equal(await scalarEvent.isOutcomeSet.call(), true)

        //Redeem winnings for buyer account
        const buyerWinnings = await utils.getParamFromTxEvent(
        await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
        assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
       
        //Withdraw ETH from oracle contract
        var bal1 = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
        await oracle.withdraw()
        var bal2 = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
        assert(bal2 > bal1, "withdraw should work")

        //Change oracle owner
        await oracle.replaceOwner(accounts[1])
        assert.equal(await oracle.owner.call(), accounts[1],"set owner should work")
    })

    it('Test oracle owner withdraw', async () => {
                //Create Fallback Tellor Oracle
        oracle = await utils.getParamFromTxEvent(
            await tellorFallbackOracleFactory.createTellorFallbackOracle(userContract._address,86400,1,_endDate,web3.utils.toWei('1','ether')),
            'tellorFallbackOracle', TellorFallbackOracle
        )

        //create scalar event
        scalarEvent = await utils.getParamFromTxEvent(
            await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
            'scalarEvent', ScalarEvent
        )

        //Collaterize outcomes-create both outcomes
        await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]) - collateralTokenCount,0)

        //Approve the scalarEvent contract to sell the outcomes
        await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
        
        //Buy all outcomes
        await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
        assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

        //Create outcome tokens short/long
        const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
        const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
        assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
        assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

        //Set outcome to zero in oracle contract
        await oracle.setOutcome(0)
        assert.equal(await oracle.getOutcome.call(), 0)
        //Ensure the outcome value has not been finalized yet
        assert.equal(await oracle.isOutcomeSet.call(), false)
        
        //Initiate dispute of oracle value, the value now will fall back to Tellor's value
        await oracle.dispute({value:web3.utils.toWei('1','ether')})
        utils.advanceTime(86400*2)

        //Tellor mines the data requested
        for(var i =1;i<6;i++){
            await web3.eth.sendTransaction({to:master._address,from:accounts[i],gas:2000000,data:tellor.methods.submitMiningSolution("1",1,100).encodeABI()})      
        }
        utils.advanceTime(86400*2)
        //Set Tellor outcome
        await oracle.setTellorOutcome()
        assert.equal(await oracle.getOutcome.call(), 100)
        assert.equal(await oracle.isOutcomeSet.call(), true)

        //Withdraw ETH from oracle contract
        var bal1 = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
        await oracle.withdraw()
        var bal2 = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
        assert(bal2 > bal1, "withdraw should work")
    })

    it('Test change oracle owner', async () => {
        //Create Fallback Tellor Oracle
        oracle = await utils.getParamFromTxEvent(
            await tellorFallbackOracleFactory.createTellorFallbackOracle(userContract._address,86400,1,_endDate,web3.utils.toWei('1','ether')),
            'tellorFallbackOracle', TellorFallbackOracle
        )

        //Change oracle owner
        await oracle.replaceOwner(accounts[1])
        assert.equal(await oracle.owner.call(), accounts[1],"set owner should work")
    })
})