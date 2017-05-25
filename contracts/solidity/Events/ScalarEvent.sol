pragma solidity 0.4.11;
import "Events/AbstractEvent.sol";


/// @title Scalar event contract - Scalar events resolve to a number within a range
/// @author Stefan George - <stefan@gnosis.pm>
contract ScalarEvent is Event {

    /*
     *  Constants
     */
    uint8 public constant SHORT = 0;
    uint8 public constant LONG = 1;
    uint16 public constant OUTCOME_RANGE = 10000;

    /*
     *  Storage
     */
    int public lowerBound;
    int public upperBound;

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets basic event properties
    /// @param _collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param _oracle Oracle contract used to resolve the event
    /// @param _lowerBound Lower bound for event outcome
    /// @param _upperBound Lower bound for event outcome
    function ScalarEvent(
        Token _collateralToken,
        Oracle _oracle,
        int _lowerBound,
        int _upperBound
    )
        public
        Event(_collateralToken, _oracle, 2)
    {
        // Validate bounds
        require(_upperBound > _lowerBound);
        lowerBound = _lowerBound;
        upperBound = _upperBound;
    }

    /// @dev Exchanges user's winning outcome tokens for collateral tokens
    /// @return Returns user's winnings
    function redeemWinnings()
        public
        returns (uint winnings)
    {
        // Winning outcome should not be set yet
        require(isWinningOutcomeSet);
        // Calculate winnings
        uint16 convertedWinningOutcome;
        // Outcome is lower than defined lower bound
        if (winningOutcome < lowerBound)
            convertedWinningOutcome = 0;
        // Outcome is higher than defined upper bound
        else if (winningOutcome > upperBound)
            convertedWinningOutcome = OUTCOME_RANGE;
        // Map outcome to outcome range
        else
            convertedWinningOutcome = uint16(OUTCOME_RANGE * (winningOutcome - lowerBound) / (upperBound - lowerBound));
        uint factorShort = OUTCOME_RANGE - convertedWinningOutcome;
        uint factorLong = OUTCOME_RANGE - factorShort;
        uint shortOutcomeTokenCount = outcomeTokens[SHORT].balanceOf(msg.sender);
        uint longOutcomeTokenCount = outcomeTokens[LONG].balanceOf(msg.sender);
        winnings = (shortOutcomeTokenCount * factorShort + longOutcomeTokenCount * factorLong) / OUTCOME_RANGE;
        // Revoke all tokens of all outcomes
        outcomeTokens[SHORT].revoke(msg.sender, shortOutcomeTokenCount);
        outcomeTokens[LONG].revoke(msg.sender, longOutcomeTokenCount);
        // Payout winnings
        require(collateralToken.transfer(msg.sender, winnings));
    }

    /// @dev Calculates and returns event hash
    /// @return Returns event hash
    function getEventHash()
        public
        constant
        returns (bytes32)
    {
        return keccak256(collateralToken, oracle, lowerBound, upperBound);
    }
}
