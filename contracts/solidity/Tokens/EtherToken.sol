pragma solidity 0.4.11;
import "Tokens/StandardToken.sol";


/// @title Token contract - Token exchanging Ether 1:1
/// @author Stefan George - <stefan@gnosis.pm>
contract EtherToken is StandardToken {

    /*
     *  Events
     */
    event Deposit(address indexed sender, uint value);
    event Withdrawal(address indexed receiver, uint value);

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
    /// @param value Number of tokens to sell
    function withdraw(uint value)
        public
    {
        if (balances[msg.sender] < value)
            // Overflow operation
            revert();
        balances[msg.sender] -= value;
        totalSupply -= value;
        msg.sender.transfer(value);
        Withdrawal(msg.sender, value);
    }
}
