// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.7.0;
import "../Markets/Market.sol";


/// @title Abstract market maker contract - Functions to be implemented by market maker contracts
abstract contract MarketMaker {

    /*
     *  Public functions
     */
    function calcCost(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount) public virtual view returns (uint);
    function calcProfit(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount) public virtual view returns (uint);
    function calcNetCost(Market market, int[] memory outcomeTokenAmounts) public virtual view returns (int);
    function calcMarginalPrice(Market market, uint8 outcomeTokenIndex) public virtual view returns (uint);
}
