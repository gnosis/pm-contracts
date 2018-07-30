const utils = require('./utils')
const { getBlock } = utils
const { wait } = require('@digix/tempo')(web3)

const EtherToken = artifacts.require('EtherToken')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const OutcomeToken = artifacts.require('OutcomeToken')

const contracts = [EtherToken, CentralizedOracle, CentralizedOracleFactory, StandardMarketWithPriceLogger, LMSRMarketMaker, CategoricalEvent, ScalarEvent, OutcomeToken]

contract('Oracle', function (accounts) {
    let centralizedOracleFactory
    let difficultyOracleFactory
    let majorityOracleFactory
    let ultimateOracleFactory
    let futarchyOracleFactory
    let lmsrMarketMaker
    let etherToken
    let ipfsHash, ipfsBytes
    let spreadMultiplier, challengePeriod, challengeAmount, frontRunnerPeriod
    let fee, deadline, funding, startDate

    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    beforeEach(async () => {
        // deployed factory contracts
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed.call()
        etherToken = await EtherToken.deployed()

        // ipfs hashes
        ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        ipfsBytes = '0x516d597741504a7a7635435a736e4136323573335866326e656d7459675070486457457a37396f6a576e50626447'

        // Ultimate oracle stuff
        spreadMultiplier = 2
        challengePeriod = 200 // 200s
        challengeAmount = 100 // 100wei
        frontRunnerPeriod = 50 // 50s

        // Futarchy oracle stuff
        fee = 500000 // 5%
        deadline = 100 // 100s
        funding = 10**18 // 1 ETH
        startDate = 0
    })

    it('should test centralized oracle', async () => {
        // Create centralized oracle factory
        const owner1 = 0
        const owner2 = 1

        // create centralized oracle
        const centralizedOracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash, { from: accounts[owner1] }),
            'centralizedOracle', CentralizedOracle
        )
        // Replace account resolving outcome
        assert.equal(await centralizedOracle.owner.call(), accounts[owner1])
        await centralizedOracle.replaceOwner(accounts[owner2], {from: accounts[owner1]})
        assert.equal(await centralizedOracle.owner.call(), accounts[owner2])

        // Set outcome
        await utils.assertRejects(centralizedOracle.setOutcome(0, {from: accounts[owner1]}), "owner1 is not the centralized oracle owner")
        assert.equal(await centralizedOracle.isOutcomeSet.call(), false)

        await centralizedOracle.setOutcome(1, {from: accounts[owner2]})
        assert.equal(await centralizedOracle.isOutcomeSet.call(), true)
        assert.equal(await centralizedOracle.getOutcome.call(), 1)
        assert.equal(await centralizedOracle.ipfsHash.call(), ipfsBytes)
    })
})
