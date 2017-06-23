var Math = artifacts.require("./Utils/Math");
var EventFactory = artifacts.require("./Events/EventFactory.sol");
var EtherToken = artifacts.require("./Tokens/EtherToken.sol");
var CentralizedOracleFactory = artifacts.require("./Oracles/CentralizedOracleFactory.sol")
var UltimateOracleFactory = artifacts.require("./Oracles/UltimateOracleFactory.sol");
var LMSRMarketMaker = artifacts.require("./MarketMakers/LMSRMarketMaker.sol");
var StandardMarketFactory = artifacts.require("./Markets/StandardMarketFactory.sol");

//this can't be made async await.
module.exports = function(deployer) {
  deployer.deploy(Math)

  .then( () => deployer.link(Math, EventFactory))
  .then( () => deployer.deploy(EventFactory, Math.address))

  .then( () => deployer.deploy(CentralizedOracleFactory))

  .then( () => deployer.link(Math, UltimateOracleFactory))
  .then( () => deployer.deploy(UltimateOracleFactory))

  .then( () => deployer.link(Math, LMSRMarketMaker))
  .then( () => deployer.deploy(LMSRMarketMaker, Math.address))

  .then( () => deployer.link(Math, StandardMarketFactory))
  .then( () => deployer.deploy(StandardMarketFactory, Math.address))

  .then( () => deployer.link(Math, EtherToken))
  .then( () => deployer.deploy(EtherToken, Math.address));

};
