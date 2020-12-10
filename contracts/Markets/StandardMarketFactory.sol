// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.7.0;
import "../Markets/StandardMarket.sol";


/// @title Market factory contract - Allows to create market contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract StandardMarketFactory {

    /*
     *  Events
     */
    event StandardMarketCreation(address indexed creator, Market market, Event eventContract, MarketMaker marketMaker, uint24 fee);

    /*
     *  Storage
     */
    StandardMarket public standardMarketMasterCopy;

    /*
     *  Public functions
     */
    constructor(StandardMarket _standardMarketMasterCopy) {
        standardMarketMasterCopy = _standardMarketMasterCopy;
    }

    /// @dev Creates a new market contract
    /// @param eventContract Event contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @return market Market contract
    function createMarket(Event eventContract, MarketMaker marketMaker, uint24 fee)
        public
        returns (StandardMarket market)
    {
        market = StandardMarket(address(new StandardMarketProxy(address(standardMarketMasterCopy), msg.sender, eventContract, marketMaker, fee)));
        emit StandardMarketCreation(msg.sender, market, eventContract, marketMaker, fee);
    }
}
