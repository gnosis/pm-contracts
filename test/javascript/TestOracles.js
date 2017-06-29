const utils = require('../utils')

// const Event = artifacts.require('Event')
// const EventFactory = artifacts.require('EventFactory')
// const Token = artifacts.require('Token')
// const EtherToken = artifacts.require('EtherToken')
// const Oracle = artifacts.require('Oracle')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const difficultyOracle = artifacts.require('DifficultyOracle')
const DifficultyOracleFactory = artifacts.require('DifficultyOracleFactory')
const MajorityOracle = artifacts.require('MajorityOracle')
const MajorityOracleFactory = artifacts.require('MajorityOracleFactory')


contract('oracle', function (accounts) {
    let centralizedOracleFactory
    let difficultyOracleFactory
    let majorityOracleFactory
    // let eventFactory
    // let etherToken
    let ipfsHash, ipfsBytes
    let centralizedOracle, majorityOracle
    //event

    beforeEach(async () => {
        // eventFactory = await EventFactory.deployed()
        // etherToken = await EtherToken.deployed()
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        majorityOracleFactory = await MajorityOracleFactory.deployed()
        // create oracle
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        ipfsBytes = '0x516d597741504a7a7635435a736e4136323573335866326e656d7459675070486457457a37396f6a576e50626447'
        // oracle = utils.getParamFromTxEvent(
        //     await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
        //     'centralizedOracle', centralizedOracle
        // )
        // event = utils.getParamFromTxEvent(
        //     await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
        //     'categoricalEvent', Event
        // )
    })

    it('should test centralized oracle', async () => {
        //Create centralized oracle factory
        const owner1 = 0
        const owner2 = 1

        //create centralized oracle
        centralizedOracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner1]}),
            'centralizedOracle', CentralizedOracle
        )
        //Replace account resolving outcome
        assert.equal(await centralizedOracle.owner(), accounts[owner1])
        await centralizedOracle.replaceOwner(accounts[owner2], {from: accounts[owner1]})
        assert.equal(await centralizedOracle.owner(), accounts[owner2])

        //Set outcome
        await utils.assertRejects(centralizedOracle.setOutcome(0, {from: accounts[owner1]}), "owner1 is not the centralized oracle owner")
        assert.equal(await centralizedOracle.isOutcomeSet(), false)

        await centralizedOracle.setOutcome(1, {from: accounts[owner2]})
        assert.equal(await centralizedOracle.isOutcomeSet(), true)
        assert.equal(await centralizedOracle.getOutcome(), 1)
        assert.equal(await centralizedOracle.ipfsHash(), ipfsBytes)
    })

    it('should test difficulty oracle', async () =>{
        //TODO: import web3 api to monitor block numbers?
    //     //Create difficulty oracle factory
    //     difficultyOracleFactory = await DifficultyOracleFactory.deployed()
    //
    //     //Create difficulty oracle
    //     const blockNumber = await web3.eth.getBlockNumber()
    //     oracle = utils.getParamFromTxEvent(
    //         await difficultyOracleFactory.createDifficultyOracle(blockNumber),
    //         'difficultyOracle', difficultyOracle
    //     )
    //
    //     //Set outcome
    //     await utils.assertRejects(oracle.setOutcome)
    //     assert.equals(oracle.isOutcomeSet(), false)
    //
    //     //Wait until block 100
    //     self.s.mine(100)
    //     await oracle.setOutcome()
    //     assert.equals(await oracle.isOutcomeSet(), true)
    //     assert.greater(await oracle.getOutcome(), 0)
    })

    it('should test futarchy oracle', async () => {
        //TODO: this one was long so I skipped it
        //create futarchy oracle
        //create event
        //create markets
        //fund markets
        //buy all outcomes
        //set outcome of futarchy oracle
        //set winning outcome for scalar Events
        //close winning market and transfer collateral tokens to creator
    })

    it('should test majority oracle', async () => {

        //create Oracles
        const owner1 = 0
        const owner2 = 1
        const owner3 = 2
        const oracle1 = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner1]}),
            'centralizedOracle', CentralizedOracle
        )
        const oracle2 = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner2]}),
            'centralizedOracle', CentralizedOracle
        )
        const oracle3 = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner3]}),
            'centralizedOracle', CentralizedOracle
        )
        majorityOracle = utils.getParamFromTxEvent(
            await majorityOracleFactory.createMajorityOracle([oracle1, oracle2, oracle3]),
            'majorityOracle', MajorityOracle
        )
        
        //Majority oracle cannot be resolved yet
        assert.equal(await majorityOracle.isOutcomeSet(), false)

        //Set outcome in first centralized oracle
        await oracle1.setOutcome(1, accounts[owner1])

        //Majority vote is not reached yet
        assert.equal(await majorityOracle.isOutcomeSet(), false)

        //Set outcome in second cetnralized oracle
        await oracle2.setOutcome(1, accounts[owner2])

        //majority vote is reached
        assert.equal(await majorityOracle.isOutcomeSet(), true)
        assert.equal(await majorityOracle.getOutcome(), 1)
    })

    it('should test signed message oracle', async () => {
        //Create Oracles
        //Replace signer
        //Signing by registered signer works
        //Set outcome
        //Signed by wrong signer fails
        //Signing by registered signer works
    })

    it('should test ultimate oracle', async () => {
        //Set outcome in central oracle
        //Set outcome in ultimate oracle
        //Challenge outcome
        //Sender 2 overbids sender 1
        //Trying to withdraw before front runner period ends fails
        //Wait for front runner period to pass
        //Withdraw winnings
    })

    it('should test ultimate oracle challenge period', async () => {
        //create Oracles
        //Set outcome in central oracle
        //Set outcome in ultimate oracle
        //Wait for challenge period to pass
    })
})
