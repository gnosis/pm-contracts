pragma solidity ^0.4.15;
import "../Events/Event.sol";
import "../Utils/Proxy.sol";


contract CategoricalEventProxy is Proxy, EventData {

    /// @dev Contract constructor validates and sets basic event properties
    /// @param _collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param _oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    function CategoricalEventProxy(address proxied, address outcomeTokenMasterCopy, Token _collateralToken, Oracle _oracle, uint8 outcomeCount)
        Proxy(proxied)
        public
    {
        // Validate input
        require(address(_collateralToken) != 0 && address(_oracle) != 0 && outcomeCount >= 2);
        collateralToken = _collateralToken;
        oracle = _oracle;
        // Create an outcome token for each outcome
        for (uint8 i = 0; i < outcomeCount; i++) {
            OutcomeToken outcomeToken = OutcomeToken(new OutcomeTokenProxy(outcomeTokenMasterCopy));
            outcomeTokens.push(outcomeToken);
            OutcomeTokenCreation(outcomeToken, i);
        }
    }
}

/// @title Categorical event contract - Categorical events resolve to an outcome from a set of outcomes
/// @author Stefan George - <stefan@gnosis.pm>
contract CategoricalEvent is Proxied, Event {

    /*
     *  Public functions
     */
    /// @dev Exchanges sender's winning outcome tokens for collateral tokens
    /// @return Sender's winnings
    function redeemWinnings()
        public
        returns (uint winnings)
    {
        // Winning outcome has to be set
        require(isOutcomeSet);
        // Calculate winnings
        winnings = outcomeTokens[uint(outcome)].balanceOf(msg.sender);
        // Revoke tokens from winning outcome
        outcomeTokens[uint(outcome)].revoke(msg.sender, winnings);
        // Payout winnings
        require(collateralToken.transfer(msg.sender, winnings));
        WinningsRedemption(msg.sender, winnings);
    }

    /// @dev Calculates and returns event hash
    /// @return Event hash
    function getEventHash()
        public
        view
        returns (bytes32)
    {
        return keccak256(collateralToken, oracle, outcomeTokens.length);
    }
}
