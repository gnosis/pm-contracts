const Whitelist = artifacts.require("Whitelist");

module.exports = function(deployer) {
  deployer.deploy(Whitelist);
};
