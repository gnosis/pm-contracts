pragma solidity ^0.4.24;

import "../MarketMakers/LMSRMarketMaker.sol";

contract LMSRMarketMakerFactory {
    event LMSRMarketMakerCreation(address indexed creator, LMSRMarketMaker lmsrMarketMaker, Event eventContract, uint64 fee);

    function createLMSRMarketMaker(Event eventContract, uint64 fee)
        public
        returns (LMSRMarketMaker lmsrMarketMaker)
    {
        lmsrMarketMaker = new LMSRMarketMaker(msg.sender, eventContract, fee);
        emit LMSRMarketMakerCreation(msg.sender, lmsrMarketMaker, eventContract, fee);
    }
}
