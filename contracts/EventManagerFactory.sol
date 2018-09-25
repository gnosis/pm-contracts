pragma solidity ^0.4.24;

import "./EventManager.sol";

contract EventManagerFactory {
    event EventManagerCreation(address indexed creator, EventManager eventManager, ERC20 collateralToken);

    mapping (address => EventManager) public eventManagers;

    function createEventManager(ERC20 collateralToken)
        public
        returns (EventManager eventManager)
    {
        require(address(eventManagers[collateralToken]) == 0);
        eventManager = new EventManager(collateralToken);
        eventManagers[address(collateralToken)] = eventManager;
        emit EventManagerCreation(msg.sender, eventManager, collateralToken);
        return eventManager;
    }
}
