pragma solidity ^0.4.24;

import "../MarketMakers/LMSRMarketMaker.sol";

contract LMSRMarketMakerFactory {
    event LMSRMarketMakerCreation(address indexed creator, LMSRMarketMaker lmsrMarketMaker, EventManager eventManager, bytes32 outcomeTokenSetId, uint64 fee);

    function createLMSRMarketMaker(EventManager eventManager, bytes32 outcomeTokenSetId, uint64 fee)
        public
        returns (LMSRMarketMaker lmsrMarketMaker)
    {
        lmsrMarketMaker = new LMSRMarketMaker(eventManager, outcomeTokenSetId, fee);
        lmsrMarketMaker.transferOwnership(msg.sender);
        emit LMSRMarketMakerCreation(msg.sender, lmsrMarketMaker, eventManager, outcomeTokenSetId, fee);
    }
}
