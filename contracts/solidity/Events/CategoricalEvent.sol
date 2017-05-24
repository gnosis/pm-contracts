pragma solidity 0.4.11;
import "Events/AbstractEvent.sol";


/// @title Categorical event contract - Categorical events resolve to an outcome from a list of outcomes
/// @author Stefan George - <stefan@gnosis.pm>
contract CategoricalEvent is Event {

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets basic event properties
    /// @param _collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param _oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    function CategoricalEvent(
        Token _collateralToken,
        Oracle _oracle,
        uint8 outcomeCount
    )
        public
        Event(_collateralToken, _oracle, outcomeCount)
    {

    }

    /// @dev Exchanges user's winning outcome tokens for collateral tokens
    /// @return Returns user's winnings
    function redeemWinnings()
        public
        returns (uint winnings)
    {
        if (!isWinningOutcomeSet)
            // Winning outcome is not set yet
            revert();
        // Calculate winnings
        winnings = outcomeTokens[uint(winningOutcome)].balanceOf(msg.sender);
        // Revoke tokens from winning outcome
        outcomeTokens[uint(winningOutcome)].revoke(msg.sender, winnings);
        // Payout winnings
        if (!collateralToken.transfer(msg.sender, winnings))
            // Transfer failed
            revert();
    }

    /// @dev Calculates and returns event hash
    /// @return Returns event hash
    function getEventHash()
        public
        constant
        returns (bytes32)
    {
        return keccak256(collateralToken, oracle, outcomeTokens.length);
    }
}
