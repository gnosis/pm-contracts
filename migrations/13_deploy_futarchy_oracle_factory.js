const EventFactory = artifacts.require('EventFactory')
const FutarchyOracle = artifacts.require('FutarchyOracle')
const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')

module.exports = function (deployer) {
    deployer.deploy(FutarchyOracleFactory, FutarchyOracle.address, EventFactory.address, StandardMarketWithPriceLoggerFactory.address)
}
