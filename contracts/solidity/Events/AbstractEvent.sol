pragma solidity 0.4.11;
import "Tokens/AbstractToken.sol";
import "Tokens/OutcomeToken.sol";
import "Oracles/AbstractOracle.sol";


/// @title Event contract - Provide basic functionality required by different event types
/// @author Stefan George - <stefan@gnosis.pm>
contract Event {

    /*
     *  Storage
     */
    Token public collateralToken;
    Oracle public oracle;
    bool public isWinningOutcomeSet;
    int public winningOutcome;
    OutcomeToken[] public outcomeTokens;

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets basic event properties
    /// @param _collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param _oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    function Event(Token _collateralToken, Oracle _oracle, uint outcomeCount)
        public
    {
        if (address(_collateralToken) == 0 || address(_oracle) == 0 || outcomeCount < 2 || outcomeCount > 256)
            // Values are null or outcome count is too low
            revert();
        collateralToken = _collateralToken;
        oracle = _oracle;
        // Create outcome tokens for each outcome
        for (uint8 i=0; i<outcomeCount; i++)
            outcomeTokens.push(new OutcomeToken());
    }

    /// @dev Buys equal number of tokens of all outcomes, exchanging collateral tokens and all outcome tokens 1:1
    /// @param collateralTokenCount Number of collateral tokens
    function buyAllOutcomes(uint collateralTokenCount)
        public
    {
        // Transfer tokens to events contract
        if (!collateralToken.transferFrom(msg.sender, this, collateralTokenCount))
            // Transfer failed
            revert();
        // Issue new event tokens to owner
        for (uint8 i=0; i<outcomeTokens.length; i++)
            outcomeTokens[i].issue(msg.sender, collateralTokenCount);
    }

    /// @dev Sells equal number of tokens of all outcomes, exchanging collateral tokens and all outcome tokens 1:1
    /// @param outcomeTokenCount Number of outcome tokens
    function sellAllOutcomes(uint outcomeTokenCount)
        public
    {
        // Revoke tokens of all outcomes
        for (uint8 i=0; i<outcomeTokens.length; i++)
            outcomeTokens[i].revoke(msg.sender, outcomeTokenCount);
        // Transfer redeemed tokens
        if (!collateralToken.transfer(msg.sender, outcomeTokenCount))
            // Transfer failed
            revert();
    }

    /// @dev Sets winning event outcome if resolved by oracle
    function setWinningOutcome()
        public
    {
        if (isWinningOutcomeSet || !oracle.isOutcomeSet())
            // Winning outcome is set already or outcome is not set yet
            revert();
        // Set winning outcome
        winningOutcome = oracle.getOutcome();
        isWinningOutcomeSet = true;
    }

    /// @dev Returns outcome count
    /// @return Outcome count
    function getOutcomeCount()
        public
        constant
        returns (uint8)
    {
        return uint8(outcomeTokens.length);
    }

    /// @dev Returns outcome tokens array
    /// @return Outcome tokens
    function getOutcomeTokens()
        public
        constant
        returns (OutcomeToken[])
    {
        return outcomeTokens;
    }

    /// @dev Returns the amount of outcome tokens held by owner
    /// @return Outcome token distribution
    function getOutcomeTokenDistribution(address owner)
        public
        constant
        returns (uint[] outcomeTokenDistribution)
    {
        outcomeTokenDistribution = new uint[](outcomeTokens.length);
        for (uint8 i=0; i<outcomeTokenDistribution.length; i++)
            outcomeTokenDistribution[i] = outcomeTokens[i].balanceOf(owner);
    }

    /// @dev Calculates and returns event hash
    /// @return Returns event hash
    function getEventHash() public constant returns (bytes32);

    /// @dev Exchanges user's winning outcome tokens for collateral tokens
    /// @return Returns user's winnings
    function redeemWinnings() public returns (uint);
}
