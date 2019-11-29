// const utils = require('./utils')

// const CategoricalEvent = artifacts.require('CategoricalEvent')
// const ScalarEvent = artifacts.require('ScalarEvent')
// const EventFactory = artifacts.require('EventFactory')
// const OutcomeToken = artifacts.require('OutcomeToken')
// const WETH9 = artifacts.require('WETH9')
// const CentralizedOracle = artifacts.require('CentralizedOracle')
// const CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')


// contract('Event', function (accounts) {
//     let centralizedOracleFactory
//     let eventFactory
//     let etherToken
//     let ipfsHash, oracle, event


//     beforeEach(async () => {
//         centralizedOracleFactory = await CentralizedOracleFactory.deployed()
//         eventFactory = await EventFactory.deployed()
//         etherToken = await WETH9.deployed()

//         // create event
//         ipfsHash = web3.utils.utf8ToHex('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
//         oracle = await utils.getParamFromTxEvent(
//             await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
//             'centralizedOracle', CentralizedOracle
//         )
//         event = await utils.getParamFromTxEvent(
//             await eventFactory.createCategoricalEvent(etherToken.address, oracle.address, 2),
//             'categoricalEvent', CategoricalEvent
//         )
//     })

//     it('should buy and sell all outcomes', async () => {
//         // Buy all outcomes
//         const buyer = 0
//         const collateralTokenCount = 1e19.toString() // https://github.com/ethereum/web3.js/issues/2077
//         const collateralTokenCountOver10 = 1e18.toString()
//         await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount) 

//         await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
//         for(let i = 0; i < 10; i++)
//             await event.buyAllOutcomes(collateralTokenCountOver10, { from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

//         const outcomeToken1 = await OutcomeToken.at(await event.outcomeTokens.call(0))
//         const outcomeToken2 = await OutcomeToken.at(await event.outcomeTokens.call(1))
//         assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
//         assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

//         // Sell all outcomes
//         await event.sellAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
//         assert.equal(await etherToken.balanceOf.call(event.address), 0)
//         assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
//         assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
//     })

//     it('should buy and verify outcomes', async () => {
//         // Buy all outcomes
//         const buyer = 1
//         const collateralTokenCount = 1e19.toString()
//         const collateralTokenCountDividedBy10 = 1e18.toString()
//         await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

//         await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
//         for(let i = 0; i < 10; i++)
//             await event.buyAllOutcomes(collateralTokenCountDividedBy10, { from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

//         const outcomeToken1 = await OutcomeToken.at(await event.outcomeTokens.call(0))
//         const outcomeToken2 = await OutcomeToken.at(await event.outcomeTokens.call(1))
//         assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
//         assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

//         // Validate getters
//         assert.equal(await event.getOutcomeCount.call(), 2)
//         assert.deepEqual(await event.getOutcomeTokens.call(), [await event.outcomeTokens.call(0), await event.outcomeTokens.call(1)])
//         //using parseInt and .valueOf because of strictEqual comparison in arrays.deepEqual()
//         const outcomeTokenDistribution = await event.getOutcomeTokenDistribution.call(accounts[buyer])
//         assert.deepEqual(
//             [parseInt(outcomeTokenDistribution[0].valueOf(), 10).toString(), parseInt(outcomeTokenDistribution[1].valueOf(), 10).toString()],
//             [collateralTokenCount, collateralTokenCount])
//     })

//     it('should buy, set and redeem outcomes for categorical event', async () => {
//         // Buy all outcomes
//         const buyer = 2
//         const collateralTokenCount = 10
//         await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

//         await etherToken.approve(event.address, collateralTokenCount, { from: accounts[buyer] })
//         await event.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(event.address), collateralTokenCount)
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

//         const outcomeToken1 = await OutcomeToken.at(await event.outcomeTokens.call(0))
//         const outcomeToken2 = await OutcomeToken.at(await event.outcomeTokens.call(1))
//         assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
//         assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

//         //Set outcome in oracle contract
//         await oracle.setOutcome(1)
//         assert.equal(await oracle.getOutcome.call(), 1)
//         assert.equal(await oracle.isOutcomeSet.call(), true)

//         //Set outcome in event
//         await event.setOutcome()
//         assert.equal(await event.outcome.call(), 1)
//         assert.equal(await event.isOutcomeSet.call(),true)

//         //Redeem winnings for buyer account
//         const buyerWinnings = await utils.getParamFromTxEvent(
//             await event.redeemWinnings({ from: accounts[buyer] }), 'winnings')
//         assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
//         assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
//         assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
//     })

//     it('should buy, set, and redeem outcomes for scalar event', async () => {
//         const scalarEvent = await utils.getParamFromTxEvent(
//             await eventFactory.createScalarEvent(etherToken.address, oracle.address, -100, 100),
//             'scalarEvent', ScalarEvent
//         )
//         // Buy all outcomes
//         const buyer = 3
//         const collateralTokenCount = 10
//         await etherToken.deposit({ value: collateralTokenCount, from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)

//         await etherToken.approve(scalarEvent.address, collateralTokenCount, { from: accounts[buyer] })
//         await scalarEvent.buyAllOutcomes(collateralTokenCount, { from: accounts[buyer] })
//         assert.equal(await etherToken.balanceOf.call(scalarEvent.address), collateralTokenCount)
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), 0)

//         const outcomeToken1 = await OutcomeToken.at(await scalarEvent.outcomeTokens(0))
//         const outcomeToken2 = await OutcomeToken.at(await scalarEvent.outcomeTokens(1))
//         assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), collateralTokenCount)
//         assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), collateralTokenCount)

//         //Set outcome in oracle contract
//         await oracle.setOutcome(0)
//         assert.equal(await oracle.getOutcome.call(), 0)
//         assert.equal(await oracle.isOutcomeSet.call(), true)

//         //Set outcome in event
//         await scalarEvent.setOutcome()
//         assert.equal(await scalarEvent.outcome.call(), 0)
//         assert.equal(await scalarEvent.isOutcomeSet.call(), true)

//         //Redeem winnings for buyer account
//         const buyerWinnings = await utils.getParamFromTxEvent(
//             await scalarEvent.redeemWinnings({ from: accounts[buyer] }), 'winnings')
//         assert.equal(buyerWinnings.valueOf(), collateralTokenCount)
//         assert.equal(await outcomeToken1.balanceOf.call(accounts[buyer]), 0)
//         assert.equal(await outcomeToken2.balanceOf.call(accounts[buyer]), 0)
//         assert.equal(await etherToken.balanceOf.call(accounts[buyer]), collateralTokenCount)
//     })
// })
