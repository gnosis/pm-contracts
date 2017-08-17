const utils = require('./utils')

const { wait } = require('@digix/tempo')(web3)

const EtherToken = artifacts.require('EtherToken')
const CentralizedOracle = artifacts.require('CentralizedOracle')
const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
const DifficultyOracle = artifacts.require('DifficultyOracle')
const DifficultyOracleFactory = artifacts.require('DifficultyOracleFactory')
const MajorityOracle = artifacts.require('MajorityOracle')
const MajorityOracleFactory = artifacts.require('MajorityOracleFactory')
const UltimateOracle = artifacts.require('UltimateOracle')
const UltimateOracleFactory = artifacts.require('UltimateOracleFactory')
const FutarchyOracle = artifacts.require('FutarchyOracle')
const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
const StandardMarketWithPriceLogger = artifacts.require('StandardMarketWithPriceLogger')
const LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
const CategoricalEvent = artifacts.require('CategoricalEvent')
const ScalarEvent = artifacts.require('ScalarEvent')
const Token = artifacts.require('Token')

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

    beforeEach(async () => {
        // deployed factory contracts
        centralizedOracleFactory = await CentralizedOracleFactory.deployed()
        difficultyOracleFactory = await DifficultyOracleFactory.deployed()
        majorityOracleFactory = await MajorityOracleFactory.deployed()
        ultimateOracleFactory = await UltimateOracleFactory.deployed()
        futarchyOracleFactory = await FutarchyOracleFactory.deployed()
        lmsrMarketMaker = await LMSRMarketMaker.deployed()
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
        assert.equal(await centralizedOracle.owner(), accounts[owner1])
        await centralizedOracle.replaceOwner(accounts[owner2], {from: accounts[owner1]})
        assert.equal(await centralizedOracle.owner(), accounts[owner2])

        // Set outcome
        await utils.assertRejects(centralizedOracle.setOutcome(0, {from: accounts[owner1]}), "owner1 is not the centralized oracle owner")
        assert.equal(await centralizedOracle.isOutcomeSet(), false)

        await centralizedOracle.setOutcome(1, {from: accounts[owner2]})
        assert.equal(await centralizedOracle.isOutcomeSet(), true)
        assert.equal(await centralizedOracle.getOutcome(), 1)
        assert.equal(await centralizedOracle.ipfsHash(), ipfsBytes)
    })

    it('should test difficulty oracle', async () => {
        // Create difficulty oracle
        const targetBlock = (await web3.eth.getBlock('latest')).number + 100
        const difficultyOracle = utils.getParamFromTxEvent(
            await difficultyOracleFactory.createDifficultyOracle(targetBlock),
            'difficultyOracle', DifficultyOracle
        )

        // Set outcome
        await utils.assertRejects(difficultyOracle.setOutcome())
        assert.equal(await difficultyOracle.isOutcomeSet(), false)

        // TODO: TestRPC difficulty is 0, so these tests won't pass there

        // // Wait until block 100
        // await waitUntilBlock(20, targetBlock)

        // await difficultyOracle.setOutcome()
        // assert.equal(await difficultyOracle.isOutcomeSet(), true)
        // assert.isAbove(await difficultyOracle.getOutcome(), 0)
    })

    it('should test futarchy oracle', async () => {
        // Create Oracles
        const centralizedOracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )

        const futarchyOracle = utils.getParamFromTxEvent(
            await futarchyOracleFactory.createFutarchyOracle(
                etherToken.address, centralizedOracle.address, 2, -100, 100,
                lmsrMarketMaker.address, fee, deadline, startDate),
            'futarchyOracle', FutarchyOracle
        )
        const creator = 0
        await etherToken.deposit({ value: funding, from: accounts[creator] })
        assert.equal(await etherToken.balanceOf(accounts[creator]), funding)

        await etherToken.approve(futarchyOracle.address, funding, { from: accounts[creator] })
        await futarchyOracle.fund(funding, { from: accounts[creator] })

        const market = StandardMarketWithPriceLogger.at(await futarchyOracle.markets(1))
        const categoricalEvent = CategoricalEvent.at(await futarchyOracle.categoricalEvent())

        // Buy into market for outcome token 1
        const buyer = 1
        const outcome = 1
        const tokenCount = 1e15

        const outcomeTokenCost = await lmsrMarketMaker.calcCost(market.address, outcome, tokenCount)
        let marketfee = await market.calcMarketFee(outcomeTokenCost)
        const cost = marketfee.add(outcomeTokenCost)

        // Buy all outcomes
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]), cost.valueOf())
        await etherToken.approve(categoricalEvent.address, cost, { from: accounts[buyer] })
        await categoricalEvent.buyAllOutcomes(cost, { from: accounts[buyer] })

        // Buy long tokens from market 1
        const collateralToken = Token.at(await categoricalEvent.outcomeTokens(1))
        await collateralToken.approve(market.address, cost, { from: accounts[buyer] })

        assert.equal(utils.getParamFromTxEvent(
            await market.buy(outcome, tokenCount, cost, { from: accounts[buyer] }), 'outcomeTokenCost'
        ), outcomeTokenCost.valueOf())

        // Set outcome of futarchy oracle
        await utils.assertRejects(
            futarchyOracle.setOutcome(),
            'set oracle outcome before deadline')
        await wait(deadline)
        await futarchyOracle.setOutcome()
        assert.equal(await futarchyOracle.isOutcomeSet(), true)
        assert.equal(await futarchyOracle.getOutcome(), 1)
        await categoricalEvent.setOutcome()

        // Set winning outcome for scalar events
        await utils.assertRejects(
            futarchyOracle.close(),
            'Futarchy oracle cannot be closed if oracle for scalar market is not set')
        await centralizedOracle.setOutcome(-50)
        const scalarEvent = ScalarEvent.at(await market.eventContract())
        await scalarEvent.setOutcome()

        // Close winning market and transfer collateral tokens to creator
        await futarchyOracle.close({ from: accounts[creator] })
        assert.isAbove(await etherToken.balanceOf(accounts[creator]), funding)
    })

    it('should test majority oracle', async () => {
        // create Oracles
        const owners = [0, 1, 2]
        const oracles = (await Promise.all(
            owners.map((owner) => centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner]}))
        )).map((tx) => utils.getParamFromTxEvent(tx, 'centralizedOracle', CentralizedOracle))

        const majorityOracle = utils.getParamFromTxEvent(
            await majorityOracleFactory.createMajorityOracle(oracles.map((o) => o.address)),
            'majorityOracle', MajorityOracle
        )

        // Majority oracle cannot be resolved yet
        assert.equal(await majorityOracle.isOutcomeSet(), false)

        // Set outcome in first centralized oracle
        await oracles[0].setOutcome(1, { from: accounts[owners[0]] })

        // Majority vote is not reached yet
        assert.equal(await majorityOracle.isOutcomeSet(), false)

        // Set outcome in second centralized oracle
        await oracles[1].setOutcome(1, { from: accounts[owners[1]] })

        // // majority vote is reached
        assert.equal(await majorityOracle.isOutcomeSet(), true)
        assert.equal(await majorityOracle.getOutcome(), 1)
    })

    // TODO: test signed message oracle

    it('should test ultimate oracle', async () => {
        // Create Oracles
        const centralizedOracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
            'centralizedOracle', CentralizedOracle
        )
        const ultimateOracle = utils.getParamFromTxEvent(
            await ultimateOracleFactory.createUltimateOracle(
                centralizedOracle.address, etherToken.address,
                spreadMultiplier, challengePeriod, challengeAmount, frontRunnerPeriod),
            'ultimateOracle', UltimateOracle
        )

        // Set outcome in central oracle
        await centralizedOracle.setOutcome(1)
        assert.equal(await centralizedOracle.getOutcome(), 1)

        // Set outcome in ultimate oracle
        await ultimateOracle.setForwardedOutcome()
        assert.equal(await ultimateOracle.forwardedOutcome(), 1)
        assert.equal(await ultimateOracle.isOutcomeSet(), false)

        // Challenge outcome
        const sender1 = 0
        await etherToken.deposit({value: 100, from: accounts[sender1]})
        await etherToken.approve(ultimateOracle.address, 100, { from: accounts[sender1] })
        await ultimateOracle.challengeOutcome(2)

        // Sender 1 tries to increase their bid but can't
        await etherToken.deposit({value: 50, from: accounts[sender1]})
        await etherToken.approve(ultimateOracle.address, 50, { from: accounts[sender1] })
        await ultimateOracle.voteForOutcome(2, 50, { from: accounts[sender1] })
        assert.equal(await ultimateOracle.outcomeAmounts(accounts[sender1], 2), 100)

        // Sender 2 overbids sender 1
        const sender2 = 1
        await etherToken.deposit({value: 150, from: accounts[sender2]})
        await etherToken.approve(ultimateOracle.address, 150, { from: accounts[sender2] })
        await ultimateOracle.voteForOutcome(3, 150, { from: accounts[sender2] })
        assert.equal(await ultimateOracle.outcomeAmounts(accounts[sender2], 3), 150)

        // Sender 2 tries to increase his front runner position by 150 but can only increase it by 50
        await etherToken.deposit({value: 150, from: accounts[sender2]})
        await etherToken.approve(ultimateOracle.address, 150, { from: accounts[sender2] })
        await ultimateOracle.voteForOutcome(3, 150, { from: accounts[sender2] })
        assert.equal(await ultimateOracle.outcomeAmounts(accounts[sender2], 3), 200)

        // Trying to withdraw before front runner period ends fails
        await utils.assertRejects(
            ultimateOracle.withdraw({from: accounts[sender2]}),
            'withdrew before front runner period')

        // Wait for front runner period to pass
        assert.equal(await ultimateOracle.isOutcomeSet(), false)
        await wait(frontRunnerPeriod + 1)
        assert.equal(await ultimateOracle.isOutcomeSet(), true)

        assert.equal(await ultimateOracle.getOutcome(), 3)

        // Withdraw winnings
        assert.equal(utils.getParamFromTxEvent(
            await ultimateOracle.withdraw({from: accounts[sender2]}), 'amount'
        ).valueOf(), 300)
    })

    it('should test ultimate oracle challenge period', async () => {
        // create Oracles
        const owner1 = 0
        const centralizedOracle = utils.getParamFromTxEvent(
            await centralizedOracleFactory.createCentralizedOracle(ipfsHash, {from: accounts[owner1]}),
            'centralizedOracle', CentralizedOracle
        )
        const ultimateOracle = utils.getParamFromTxEvent(
            await ultimateOracleFactory.createUltimateOracle(
                centralizedOracle.address, etherToken.address,
                spreadMultiplier, challengePeriod, challengeAmount, frontRunnerPeriod),
                'ultimateOracle', UltimateOracle
        )

        // Set outcome in central oracle
        await centralizedOracle.setOutcome(1)
        assert.equal(await centralizedOracle.getOutcome(), 1)

        // Set outcome in ultimate oracle
        await ultimateOracle.setForwardedOutcome()
        assert.equal(await ultimateOracle.forwardedOutcome(), 1)
        assert.equal(await ultimateOracle.isOutcomeSet(), false)

        // Wait for challenge period to pass
        await wait(challengePeriod + 1)
        assert.equal(await ultimateOracle.isOutcomeSet(), true)
        assert.equal(await ultimateOracle.getOutcome(), 1)
    })
})
