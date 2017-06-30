let Math = artifacts.require('Math')
let EventFactory = artifacts.require('EventFactory')
let EtherToken = artifacts.require('EtherToken')
let CentralizedOracleFactory = artifacts.require('CentralizedOracleFactory')
let MajorityOracleFactory = artifacts.require('MajorityOracleFactory')
let DifficultyOracleFactory = artifacts.require('DifficultyOracleFactory')
let FutarchyOracleFactory = artifacts.require('FutarchyOracleFactory')
let UltimateOracleFactory = artifacts.require('UltimateOracleFactory')
let LMSRMarketMaker = artifacts.require('LMSRMarketMaker')
let StandardMarketFactory = artifacts.require('StandardMarketFactory')
let CampaignFactory = artifacts.require('CampaignFactory')

module.exports = function (deployer) {
    deployer.deploy(Math)

    deployer.link(Math, EventFactory)
    deployer.deploy(EventFactory).then(() => {
        deployer.deploy(FutarchyOracleFactory, EventFactory.address)
    })

    deployer.deploy(CentralizedOracleFactory)
    deployer.deploy(MajorityOracleFactory)
    deployer.deploy(DifficultyOracleFactory)

    deployer.link(Math, UltimateOracleFactory)
    deployer.deploy(UltimateOracleFactory)

    deployer.link(Math, LMSRMarketMaker)
    deployer.deploy(LMSRMarketMaker)

    deployer.link(Math, StandardMarketFactory)
    deployer.deploy(StandardMarketFactory)

    deployer.link(Math, EtherToken)
    deployer.deploy(EtherToken)

    deployer.link(Math, CampaignFactory)
    deployer.deploy(CampaignFactory)
}
