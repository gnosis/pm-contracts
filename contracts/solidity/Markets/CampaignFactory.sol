pragma solidity 0.4.11;
import "Markets/Campaign.sol";


/// @title Campaign factory contract - Allows to create campaign contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract CampaignFactory {

    /*
     *  Events
     */
    event CampaignCreation(address indexed creator, uint creationDate, Campaign campaign, Event eventContract, MarketFactory marketFactory, MarketMaker marketMaker, uint fee, uint funding, uint deadline);

    /*
     *  Public functions
     */
    /// @dev Creates a new campaign contract
    /// @param eventContract Event contract
    /// @param marketFactory Market factory contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @param funding Initial funding for market
    /// @param deadline Campaign deadline
    /// @return Returns market contract
    function createCampaigns(
        Event eventContract,
        MarketFactory marketFactory,
        MarketMaker marketMaker,
        uint fee,
        uint funding,
        uint deadline
    )
        public
        returns (Campaign campaign)
    {
        campaign = new Campaign(eventContract, marketFactory, marketMaker, fee, funding, deadline);
        CampaignCreation(msg.sender, now, campaign, eventContract, marketFactory, marketMaker, fee, funding, deadline);
    }
}
