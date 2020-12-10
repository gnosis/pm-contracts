// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.7.0;
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
    constructor(StandardMarketWithPriceLogger _standardMarketWithPriceLoggerMasterCopy) {
        standardMarketWithPriceLoggerMasterCopy = _standardMarketWithPriceLoggerMasterCopy;
    }

    /// @dev Creates a new market contract
    /// @param eventContract Event contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @param startDate Start date for price logging
    /// @return market Market contract
    function createMarket(Event eventContract, MarketMaker marketMaker, uint24 fee, uint startDate)
        public
        returns (StandardMarketWithPriceLogger market)
    {
        market = StandardMarketWithPriceLogger(address(new StandardMarketWithPriceLoggerProxy(
            address(standardMarketWithPriceLoggerMasterCopy), msg.sender, eventContract, marketMaker, fee, startDate)));
        emit StandardMarketWithPriceLoggerCreation(msg.sender, market, eventContract, marketMaker, fee, startDate);
    }
}
