const utils = require("./utils");
const {
  getParamFromTxEvent,
  assertRejects,
} = utils;

const CategoricalEvent = artifacts.require("CategoricalEvent");
const EventFactory = artifacts.require("EventFactory");
const WETH9 = artifacts.require("WETH9");
const CentralizedOracle = artifacts.require("CentralizedOracle");
const CentralizedOracleFactory = artifacts.require("CentralizedOracleFactory");
const GnosisSightMarket = artifacts.require("GnosisSightMarket");
const GnosisSightMarketFactory = artifacts.require("GnosisSightMarketFactory");
const LMSRMarketMaker = artifacts.require("LMSRMarketMaker");
const Whitelist = artifacts.require("Whitelist");

contract("GnosisSightMarket (Whitelist) Tests", function(accounts) {
  let centralizedOracleFactory;
  let eventFactory;
  let etherToken;
  let gnosisSightMarketFactory;
  let lmsrMarketMaker;
  let whitelist;
  let ipfsHash, centralizedOracle, event;
  const numOutcomes = 3;

  beforeEach(async () => {
    centralizedOracleFactory = await CentralizedOracleFactory.deployed();
    eventFactory = await EventFactory.deployed();
    etherToken = await WETH9.deployed();
    gnosisSightMarketFactory = await GnosisSightMarketFactory.deployed();
    lmsrMarketMaker = await LMSRMarketMaker.deployed.call();
    whitelist = await Whitelist.deployed();
    // create event
    ipfsHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
    centralizedOracle = getParamFromTxEvent(
      await centralizedOracleFactory.createCentralizedOracle(ipfsHash),
      "centralizedOracle",
      CentralizedOracle
    );
    event = getParamFromTxEvent(
      await eventFactory.createCategoricalEvent(
        etherToken.address,
        centralizedOracle.address,
        numOutcomes
      ),
      "categoricalEvent",
      CategoricalEvent
    );
  });

  it("The whitelist core functions work", async () => {
    assert.equal(await whitelist.owner(), accounts[0]);


    assert.equal(await whitelist.userWhitelist(accounts[0]), false);
    assert.equal(await whitelist.isWhitelisted(accounts[0]), false);
  
    await assertRejects(whitelist.addToWhitelist([accounts[1], accounts[2]], { from: accounts[3] } ))
    // Address literals input is required due to Truffle 4's issue with inputing arrays, this issue is fixed in Truffle 5
    await whitelist.addToWhitelist(['0xffcf8fdee72ac11b5c542428b35eef5769c409f0', '0x22d491bde2303f2f43325b2108d26f1eaba1e32b'], { from: accounts[0] } )
    assert.equal(await whitelist.userWhitelist(accounts[1]), true);
    assert.equal(await whitelist.isWhitelisted(accounts[2]), true);
  
    await assertRejects(whitelist.removeFromWhitelist([accounts[1], accounts[2]], { from: accounts[3] } ))

    await whitelist.removeFromWhitelist(['0x22d491bde2303f2f43325b2108d26f1eaba1e32b'], { from: [accounts[0]] });
    assert.equal(await whitelist.userWhitelist(accounts[2]), false);
    assert.equal(await whitelist.isWhitelisted(accounts[2]), false);
    assert.equal(await whitelist.userWhitelist(accounts[1]), true);
  })

  it("Gnosis Sight Markets can only be traded on by Whitelisted users", async () => {
    // Create market
    const creator = 0;

    const feeFactor = 0;
    const market = getParamFromTxEvent(
      await gnosisSightMarketFactory.createMarket(
        event.address,
        lmsrMarketMaker.address,
        feeFactor,
        whitelist.address,
        { from: accounts[creator] },
      ),
      "market",
      GnosisSightMarket
    );

    // Fund market
    const funding = 100;

    await etherToken.deposit({ value: funding, from: accounts[creator] });
    assert.equal(await etherToken.balanceOf.call(accounts[creator]), funding);

    await etherToken.approve(market.address, funding, {
      from: accounts[creator]
    });
    await market.fund(funding, { from: accounts[creator] });

    // Assert that isWhitelisted modifier works correctly
        // This buyer of outcome tokens should work since it is whitelisted ( accounts[1] )
        const buyer = 1
        const outcome = 0
        const tokenCount = 1e15
        const outcomeTokenCost = await lmsrMarketMaker.calcCost.call(market.address, outcome, tokenCount)

        let fee = await market.calcMarketFee.call(outcomeTokenCost)

        const cost = fee.add(outcomeTokenCost)
        await etherToken.deposit({ value: cost, from: accounts[buyer] })
        assert.equal(await etherToken.balanceOf(accounts[buyer]).then(r => r.valueOf()), cost.valueOf())

        await etherToken.approve(market.address, cost, { from: accounts[buyer] })
        assert.equal(getParamFromTxEvent(
            await market.buy(outcome, tokenCount, cost, { from: accounts[buyer] }), 'outcomeTokenCost'
        ), outcomeTokenCost.valueOf())

        // This buyer of outcome tokens should NOT work since it is NOT whitelisted ( accounts[2] )
        const nonWhitelistedBuyer = 2
        await etherToken.deposit({ value: cost, from: accounts[nonWhitelistedBuyer] })
        assert.equal(await etherToken.balanceOf(accounts[nonWhitelistedBuyer]).then(r => r.valueOf()), cost.valueOf())

        await etherToken.approve(market.address, cost, { from: accounts[nonWhitelistedBuyer] })
        await assertRejects(market.buy(outcome, tokenCount, cost, { from: accounts[nonWhitelistedBuyer] }))        
  });
});
