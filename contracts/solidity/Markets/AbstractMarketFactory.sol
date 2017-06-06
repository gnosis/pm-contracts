pragma solidity 0.4.11;
import "Events/AbstractEvent.sol";
import "MarketMakers/AbstractMarketMaker.sol";
import "Markets/AbstractMarket.sol";


/// @title Abstract market factory contract - Functions to be implemented by market factories
contract MarketFactory {

    /*
     *  Events
     */
    event MarketCreation(address indexed creator, Market market, Event eventContract, MarketMaker marketMaker, uint fee);

    /*
     *  Public functions
     */
    function createMarket(Event eventContract, MarketMaker marketMaker, uint fee) public returns (Market);
}
