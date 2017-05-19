pragma solidity 0.4.11;
import "Markets/AbstractMarket.sol";


/// @title Abstract market maker contract - Functions to be implemented by market maker contracts
contract MarketMaker {

    function calcCosts(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount) public constant returns (uint);
    function calcProfits(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount) public constant returns (uint);
}
