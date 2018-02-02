pragma solidity 0.4.18;
import "../Markets/StandardMarketWithPriceLogger.sol";


/// @title Market factory contract - Allows to create market contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract StandardMarketWithPriceLoggerFactory {

    /*
     *  Events
     */
    event StandardMarketWithPriceLoggerCreation(address indexed creator, Market market, Event eventContract, MarketMaker marketMaker, uint24 fee, uint startDate);

    /*
     *  Storage
     */
    StandardMarketWithPriceLogger public standardMarketWithPriceLoggerMasterCopy;

    /*
     *  Public functions
     */
    function StandardMarketWithPriceLoggerFactory(StandardMarketWithPriceLogger _standardMarketWithPriceLoggerMasterCopy)
        public
    {
        standardMarketWithPriceLoggerMasterCopy = _standardMarketWithPriceLoggerMasterCopy;
    }

    /// @dev Creates a new market contract
    /// @param eventContract Event contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @param startDate Start date for price logging
    /// @return Market contract
    function createMarket(Event eventContract, MarketMaker marketMaker, uint24 fee, uint startDate)
        public
        returns (StandardMarketWithPriceLogger market)
    {
        market = StandardMarketWithPriceLogger(new StandardMarketWithPriceLoggerProxy(
            standardMarketWithPriceLoggerMasterCopy, msg.sender, eventContract, marketMaker, fee, startDate));
        StandardMarketWithPriceLoggerCreation(msg.sender, market, eventContract, marketMaker, fee, startDate);
    }
}
