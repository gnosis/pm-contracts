const _ = require("lodash");
const { wait } = require("@digix/tempo")(web3);

const utils = require("./utils");
const {
  getBlock,
  getParamFromTxEvent,
  assertRejects,
  Decimal,
  randrange,
  randnums
} = utils;

const CategoricalEvent = artifacts.require("CategoricalEvent");
const EventFactory = artifacts.require("EventFactory");
const OutcomeToken = artifacts.require("OutcomeToken");
const WETH9 = artifacts.require("WETH9");
const CentralizedOracle = artifacts.require("CentralizedOracle");
const CentralizedOracleFactory = artifacts.require("CentralizedOracleFactory");
const StandardMarket = artifacts.require("StandardMarket");
const StandardMarketFactory = artifacts.require("StandardMarketFactory");
const LMSRMarketMaker = artifacts.require("LMSRMarketMaker");
const Campaign = artifacts.require("Campaign");
const CampaignFactory = artifacts.require("CampaignFactory");

contract("StandardMarket", function(accounts) {
  let centralizedOracleFactory;
  let eventFactory;
  let etherToken;
  let standardMarketFactory;
  let lmsrMarketMaker;
  let campaignFactory;
  let ipfsHash, centralizedOracle, event;
  const numOutcomes = 3;

  beforeEach(async () => {
    centralizedOracleFactory = await CentralizedOracleFactory.deployed();
    eventFactory = await EventFactory.deployed();
    etherToken = await WETH9.deployed();
    standardMarketFactory = await StandardMarketFactory.deployed();
    lmsrMarketMaker = await LMSRMarketMaker.deployed.call();
    campaignFactory = await CampaignFactory.deployed();

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

  it("can be created and closed", async () => {
    // Create market
    const buyer = 5;

    const feeFactor = 0;
    const market = getParamFromTxEvent(
      await standardMarketFactory.createMarket(
        event.address,
        lmsrMarketMaker.address,
        feeFactor,
        { from: accounts[buyer] }
      ),
      "market",
      StandardMarket
    );

    // Fund market
    const funding = 100;

    await etherToken.deposit({ value: funding, from: accounts[buyer] });
    assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding);

    await etherToken.approve(market.address, funding, {
      from: accounts[buyer]
    });
    await market.fund(funding, { from: accounts[buyer] });

    // StandardMarket can only be funded once
    await etherToken.deposit({ value: funding, from: accounts[buyer] });
    assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding);
    await etherToken.approve(market.address, funding, {
      from: accounts[buyer]
    });
    await assertRejects(
      market.fund(funding, { from: accounts[buyer] }),
      "market funded twice"
    );

    assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding);

    // Close market
    await market.close({ from: accounts[buyer] });

    // StandardMarket can only be closed once
    await assertRejects(
      market.close({ from: accounts[buyer] }),
      "market closed twice"
    );

    // Sell all outcomes
    await event.sellAllOutcomes(funding, { from: accounts[buyer] });
    assert.equal(await etherToken.balanceOf.call(accounts[buyer]), funding * 2);
  });
});
