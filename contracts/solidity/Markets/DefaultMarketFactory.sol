pragma solidity 0.4.11;
import "Markets/AbstractMarketFactory.sol";
import "Markets/DefaultMarket.sol";


/// @title Market factory contract - Allows to create market contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract DefaultMarketFactory is MarketFactory {

    /*
     *  Public functions
     */
    /// @dev Creates a new market contract
    /// @param eventContract Event contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @return Market contract
    function createMarket(Event eventContract, MarketMaker marketMaker, uint fee)
        public
        returns (Market market)
    {
        market = new DefaultMarket(msg.sender, eventContract, marketMaker, fee);
        MarketCreation(msg.sender, market, eventContract, marketMaker, fee);
    }
}
