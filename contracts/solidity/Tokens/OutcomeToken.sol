pragma solidity 0.4.11;
import "Tokens/StandardTokenWithOverflowProtection.sol";


/// @title Outcome token contract - Issuing and revoking outcome tokens
/// @author Stefan George - <stefan@gnosis.pm>
contract OutcomeToken is StandardTokenWithOverflowProtection {

    /*
     *  Events
     */
    event Issue(address indexed owner, uint amount);
    event Revoke(address indexed owner, uint amount);

    /*
     *  Storage
     */
    address public eventContract;

    /*
     *  Modifiers
     */
    modifier isEventContract () {
        if (msg.sender != eventContract)
            // Only event contract is allowed to proceed
            revert();
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Constructor sets events contract address
    function OutcomeToken()
        public
    {
        eventContract = msg.sender;
    }
    
    /// @dev Events contract issues new tokens for address. Returns success
    /// @param _for Address of receiver
    /// @param outcomeTokenCount Number of tokens to issue
    function issue(address _for, uint outcomeTokenCount)
        public
        isEventContract
    {
        if (   !Math.safeToAdd(balances[_for], outcomeTokenCount)
            || !Math.safeToAdd(totalSupply, outcomeTokenCount))
            // Overflow operation
            revert();
        balances[_for] += outcomeTokenCount;
        totalSupply += outcomeTokenCount;
        Issue(_for, outcomeTokenCount);
    }

    /// @dev Events contract revokes tokens for address. Returns success
    /// @param _for Address of token holder
    /// @param outcomeTokenCount Number of tokens to revoke
    function revoke(address _for, uint outcomeTokenCount)
        public
        isEventContract
    {
        if (   !Math.safeToSubtract(balances[_for], outcomeTokenCount)
            || !Math.safeToSubtract(totalSupply, outcomeTokenCount))
            // Overflow operation
            revert();
        balances[_for] -= outcomeTokenCount;
        totalSupply -= outcomeTokenCount;
        Revoke(_for, outcomeTokenCount);
    }
}
