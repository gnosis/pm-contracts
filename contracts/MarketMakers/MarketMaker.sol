pragma solidity ^0.4.15;
import "../Markets/Market.sol";


/// @title Abstract market maker contract - Functions to be implemented by market maker contracts
contract MarketMaker {

    /*
     *  Public functions
     */
    function calcNetCost(Market market, int[] outcomeTokenAmounts) public view returns (int);
    function calcMarginalPrice(Market market, uint8 outcomeTokenIndex) public view returns (uint);
}
