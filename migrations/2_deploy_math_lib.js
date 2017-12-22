const Math = artifacts.require('Math')
// let EventFactory = artifacts.require('EventFactory')
// let EtherToken = artifacts.require('EtherToken')
// let CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
// let MajorityOracleFactory = artifacts.require('MajorityOracleFactory')
// let DifficultyOracleFactory = artifacts.require('DifficultyOracleFactory')
// let FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
// let UltimateOracleFactory = artifacts.require('UltimateOracleFactory')
// let LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
// let StandardMarketFactory = artifacts.require('StandardMarketFactory')
// let StandardMarketWithPriceLoggerFactory = artifacts.require('StandardMarketWithPriceLoggerFactory')
// let CampaignFactory = artifacts.require('CampaignFactory')

module.exports = function (deployer) {
    deployer.deploy(Math)
    // deployer.link(Math, [EventFactory, UltimateOracleFactory, LMSRMarketMaker, StandardMarketFactory, EtherToken])

    // deployer.deploy(CentralizedOracleFactory)
    // deployer.deploy(MajorityOracleFactory)
    // deployer.deploy(DifficultyOracleFactory)

    // deployer.link(Math, UltimateOracleFactory)
    // deployer.deploy(UltimateOracleFactory)

    // deployer.link(Math, LMSRMarketMaker)
    // deployer.deploy(LMSRMarketMaker)

    // deployer.link(Math, StandardMarketFactory)
    // deployer.deploy(StandardMarketFactory)

    // deployer.link(Math, EtherToken)
    // deployer.deploy(EtherToken)

    // deployer.link(Math, CampaignFactory)
    // deployer.deploy(CampaignFactory)

    // deployer.link(Math, StandardMarketWithPriceLoggerFactory)
    // deployer.deploy(StandardMarketWithPriceLoggerFactory).then(() =>
    //     deployer.deploy(EventFactory).then(() =>
    //         deployer.deploy(FutarchyOracleFactory, EventFactory.address, StandardMarketWithPriceLoggerFactory.address)
    //     )
    // )
}
