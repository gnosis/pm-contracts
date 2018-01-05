const Math = artifacts.require('Math')
const StandardMarket = artifacts.require('StandardMarket')
const StandardMarketFactory = artifacts.require('StandardMarketFactory')
const StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')

module.exports = function (deployer) {
    // if(StandardMarketFactory._json.unlinked_binary.indexOf('c0ffeecafec0ffeecafec0ffeecafec0ffeecafe') === -1)
    //     throw new Error(`${ StandardMarketFactory } does not have magic c0ffee proxy address`)
    StandardMarketFactory._json.unlinked_binary = StandardMarketFactory._json.unlinked_binary.replace(
        'c0ffeecafec0ffeecafec0ffeecafec0ffeecafe', StandardMarket.address.replace('0x', ''))

    deployer.link(Math, StandardMarketWithPriceLoggerFactory)
    deployer.deploy(StandardMarketFactory)
    deployer.deploy(StandardMarketWithPriceLoggerFactory)
}
