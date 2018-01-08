const EventFactory = artifacts.require('EventFactory')
const FutarchyOracle = artifacts.require('FutarchyOracle')
const FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')

module.exports = function (deployer) {
    FutarchyOracleFactory._json.unlinked_binary = FutarchyOracleFactory._json.unlinked_binary
        .replace('c0ffeecafec0ffeecafec0ffeecafec0ffeecafe', FutarchyOracle.address.replace('0x', ''))
    deployer.deploy(FutarchyOracleFactory, EventFactory.address, StandardMarketWithPriceLoggerFactory.address)
}
