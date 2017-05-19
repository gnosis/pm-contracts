pragma solidity 0.4.11;
import "Tokens/StandardTokenWithOverflowProtection.sol";


/// @title Token contract - Token exchanging Ether 1:1
/// @author Stefan George - <stefan@gnosis.pm>
contract EtherToken is StandardTokenWithOverflowProtection {

    /*
     *  Events
     */
    event Deposit(address indexed sender, uint amount);
    event Withdrawal(address indexed receiver, uint amount);

    /*
     *  Constants
     */
    string public constant name = "Ether Token";
    string public constant symbol = "ETH";
    uint8 public constant decimals = 18;

    /*
     *  Public functions
     */
    /// @dev Buys tokens with Ether, exchanging them 1:1
    function deposit()
        public
        payable
    {
        balances[msg.sender] += msg.value;
        totalSupply += msg.value;
        Deposit(msg.sender, msg.value);
    }

    /// @dev Sells tokens in exchange for Ether, exchanging them 1:1
    /// @param amount Number of tokens to sell
    function withdraw(uint amount)
        public
    {
        if (!Math.safeToSubtract(balances[msg.sender], amount))
            // Overflow operation
            revert();
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        msg.sender.transfer(amount);
        Withdrawal(msg.sender, amount);
    }
}
