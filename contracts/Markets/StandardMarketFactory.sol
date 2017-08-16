pragma solidity 0.4.15;
import "../Markets/StandardMarket.sol";


/// @title Market factory contract - Allows to create market contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract StandardMarketFactory {

    /*
     *  Events
     */
    event StandardMarketCreation(address indexed creator, Market market, Event eventContract, MarketMaker marketMaker, uint24 fee);

    /*
     *  Public functions
     */
    /// @dev Creates a new market contract
    /// @param eventContract Event contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @return Market contract
    function createMarket(Event eventContract, MarketMaker marketMaker, uint24 fee)
        public
        returns (StandardMarket market)
    {
        market = new StandardMarket(msg.sender, eventContract, marketMaker, fee);
        StandardMarketCreation(msg.sender, market, eventContract, marketMaker, fee);
    }
}
