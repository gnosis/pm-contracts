const Math = artifacts.require('Math')
const EventFactory = artifacts.require('EventFactory')
const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')

module.exports = function (deployer) {
    deployer.link(Math, FutarchyOracleFactory)
    deployer.deploy(FutarchyOracleFactory, EventFactory.address, StandardMarketWithPriceLoggerFactory.address)
}
