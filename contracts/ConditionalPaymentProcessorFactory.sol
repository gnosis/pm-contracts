pragma solidity ^0.4.24;

import "./ConditionalPaymentProcessor.sol";

contract ConditionalPaymentProcessorFactory {
    event ConditionalPaymentProcessorCreation(address indexed creator, ConditionalPaymentProcessor conditionalPaymentProcessor, ERC20 collateralToken);

    mapping (address => ConditionalPaymentProcessor) public conditionalPaymentProcessors;

    function createConditionalPaymentProcessor(ERC20 collateralToken)
        public
        returns (ConditionalPaymentProcessor conditionalPaymentProcessor)
    {
        require(address(conditionalPaymentProcessors[collateralToken]) == 0);
        conditionalPaymentProcessor = new ConditionalPaymentProcessor(collateralToken);
        emit ConditionalPaymentProcessorCreation(msg.sender, conditionalPaymentProcessor, collateralToken);
    }
}
