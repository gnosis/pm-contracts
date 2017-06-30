const utils = require('../utils')

// const Event = artifacts.require('Event')
// const EventFactory = artifacts.require('EventFactory')
const Token = artifacts.require('Token')
const EtherToken = artifacts.require('EtherToken')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
// const Oracle = artifacts.require('Oracle')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const difficultyOracle = artifacts.require('DifficultyOracle')
const DifficultyOracleFactory = artifacts.require('DifficultyOracleFactory')
const FutarchyOracle = artifacts.require('FutarchyOracle')
const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
const MajorityOracle = artifacts.require('MajorityOracle')
const MajorityOracleFactory = artifacts.require('MajorityOracleFactory')
const UltimateOracle = artifacts.require('UltimateOracle')
const UltimateOracleFactory = artifacts.require('UltimateOracleFactory')



contract('oracle', function (accounts) {
    let centralizedOracleFactory
    let difficultyOracleFactory
    let futarchyOracleFactory
    let majorityOracleFactory
    let ultimateOracleFactory
    let standardMarketFactory
    let etherToken
    let centralizedOracle, difficultyOracle, futarchyOracle, majorityOracle, ultimateOracle
    let ipfsHash, ipfsBytes
    //ultimate oracle constants
    let spreadMultiplier, challengePeriod, challengeAmount, frontRunnerPeriod

    beforeEach(async () => {
        //deployed factory contracts
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        difficultyOracleFactory = await DifficultyOracleFactory.deployed()
        futarchyOracleFactory = await FutarchyOracleFactory.deployed()
        majorityOracleFactory = await MajorityOracleFactory.deployed()
        ultimateOracleFactory = await UltimateOracleFactory.deployed()
        standardMarketFactory = await StandardMarketFactory.deployed()

        etherToken = await EtherToken.deployed()
        //ipfs hashes
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        ipfsBytes = '0x516d597741504a7a7635435a736e4136323573335866326e656d7459675070486457457a37396f6a576e50626447'

        //Ultimate oracle stuff
        spreadMultiplier = 3
        challengePeriod = 200 //200s
        challengeAmount = 100 //100wei
        frontRunnerPeriod = 50 //50s
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
        //TODO: LMSR Market instantiation
        // //create futarchy oracle
        // const fee = 50000  // 5%
        // const lower = -100
        // const upper = 100
        // //const deadline = self.s.block.timestamp + 60*60  # in 1h
        // const creator = 0
        // centralizedOracle = utils.getParamFromTxEvent(
        //     await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
        //     'centralizedOracle', CentralizedOracle
        // )
        //
        // futarchyOracle = utils.getParamFromTxEvent(
        //     await futarchyOracleFactory.createFutarchyOracle(etherToken, centralizedOracle, 2, lower, upper,
        //         standardMarketFactory, fee, deadline, {from: accounts[creator]}), 'futarchyOracle', FutarchyOracle
        // )
        //
        // //create markets
        // //fund markets
        // //buy all outcomes
        // //set outcome of futarchy oracle
        // //set winning outcome for scalar Events
        // //close winning market and transfer collateral tokens to creator
    })

    it('should test majority oracle', async () => {
        // TODO: .createMajorityOracle() has a problem with oracle array argument
        // //create Oracles
        // const owner1 = 0
        // const owner2 = 1
        // const owner3 = 2
        // const oracle1 = utils.getParamFromTxEvent(
        //     await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner1]}),
        //     'centralizedOracle', CentralizedOracle
        // )
        // const oracle2 = utils.getParamFromTxEvent(
        //     await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner2]}),
        //     'centralizedOracle', CentralizedOracle
        // )
        // const oracle3 = utils.getParamFromTxEvent(
        //     await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner3]}),
        //     'centralizedOracle', CentralizedOracle
        // )
        // majorityOracle = utils.getParamFromTxEvent(
        //     await majorityOracleFactory.createMajorityOracle([oracle1, oracle2, oracle3]),
        //     'majorityOracle', MajorityOracle
        // )
        //
        // //Majority oracle cannot be resolved yet
        // assert.equal(await majorityOracle.isOutcomeSet(), false)
        //
        // //Set outcome in first centralized oracle
        // await oracle1.setOutcome(1, accounts[owner1])
        //
        // //Majority vote is not reached yet
        // assert.equal(await majorityOracle.isOutcomeSet(), false)
        //
        // //Set outcome in second centralized oracle
        // await oracle2.setOutcome(1, accounts[owner2])
        //
        // //majority vote is reached
        // assert.equal(await majorityOracle.isOutcomeSet(), true)
        // assert.equal(await majorityOracle.getOutcome(), 1)
    })

    it('should test signed message oracle', async () => {
        //TODO: add signed message test functionality
        //Create Oracles
        //Replace signer
        //Signing by registered signer works
        //Set outcome
        //Signed by wrong signer fails
        //Signing by registered signer works
    })

    it('should test ultimate oracle', async () => {
        //TODO: find functions needed to wait for time period pass
        // //Create Oracles
        // centralizedOracle = utils.getParamFromTxEvent(
        //     await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner1]}),
        //     'centralizedOracle', CentralizedOracle
        // )
        // ultimateOracle = utils.getParamFromTxEvent(
        //     await ultimateOracleFactory.createUltimateOracle(centralizedOracle, etherToken,
        //         spreadMultiplier, challengePeriod, challengeAmount, frontRunnerPeriod),
        //         'ultimateOracle', UltimateOracle
        // )
        //
        // //Set outcome in central oracle
        // await centralizedOracle.setOutcome(1)
        // assert.equal(await centralizedOracle.getOutcome(), 1)
        //
        // //Set outcome in ultimate oracle
        // await ultimateOracle.setForwardedOutcome()
        // assert.equal(await ultimateOracle.forwardedOutcome(), 1)
        // assert.equal(await ultimateOracle.isOutcomeSet(), false)
        //
        // //Challenge outcome
        // const sender1 = 0
        // etherToken.deposit({value: 100, from: accounts[sender1]})
        // etherToken.approve(ultimateOracle, 100, accounts[sender1])
        //
        // //Sender 2 overbids sender 1
        // const sender2 = 1
        // etherToken.deposit({value: 200, from: accounts[sender2]})
        // etherToken.apporve(ultimateOracle, 200, accounts[sender2])
        // await ultimateOracle.voteForOutcome(3, 200, accounts[sender2])
        //
        // //Trying to withdraw before front runner period ends fails
        // await utils.assertRejects(ultimateOracle.withdraw({from: accounts[sender2]}), "cannot withdraw before front runner period")
        //
        // //Wait for front runner period to pass
        // assert.equal(ultimateOracle.isOutcomeSet(), false)
        // //self.s.block.timestamp += frontRunnerPeriod + 1
        // assert.equal(ultimateOracle.isOutcomeSet(), true)
        // assert.equal(ultimateOracle.getOutcome(), 3)
        //
        // //Withdraw winnings
        // assert.equal(ultimateOracle.withdraw({from: accounts[sender2]}), 300)
    })

    it('should test ultimate oracle challenge period', async () => {
        //TODO: find functions needed to wait for time period pass
        // //create Oracles
        // const owner1 = 0
        // centralizedOracle = utils.getParamFromTxEvent(
        //     await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner1]}),
        //     'centralizedOracle', CentralizedOracle
        // )
        // ultimateOracle = utils.getParamFromTxEvent(
        //     await ultimateOracleFactory.createUltimateOracle(centralizedOracle, etherToken,
        //         spreadMultiplier, challengePeriod, challengeAmount, frontRunnerPeriod),
        //         'ultimateOracle', UltimateOracle
        // )
        //
        // //Set outcome in central oracle
        // await centralizedOracle.setOutcome(1)
        // assert.equal(await centralizedOracle.getOutcome(), 1)
        //
        // //Set outcome in ultimate oracle
        // await ultimateOracle.setForwardedOutcome()
        // assert.equal(ultimateOracle.forwardedOutcome(), 1)
        // assert.equal(ultimateOracle.isOutcomeSet(), false)
        //
        // //Wait for challenge period to pass
        // //self.s.block.timestamp += challengePeriod +1
        // assert.equal(ultimateOracle.isOutcomeSet(), true)
        // assert.equal(ultimateOracle.getOutcome(), 1)
    })
})
