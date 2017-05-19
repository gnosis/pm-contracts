pragma solidity 0.4.11;
import "Tokens/AbstractToken.sol";


/// @title Disbursement contract - allows to distribute tokens over time
/// @author Stefan George - <stefan@gnosis.pm>
contract Disbursement {

    /*
     *  Storage
     */
    address public owner;
    address public receiver;
    address public wallet;
    uint public disbursementPeriod;
    uint public startDate;
    uint public withdrawnTokens;
    Token public token;

    /*
     *  Modifiers
     */
    modifier isOwner() {
        if (msg.sender != owner)
            // Only owner is allowed to proceed
            revert();
        _;
    }

    modifier isReceiver() {
        if (msg.sender != receiver)
            // Only receiver is allowed to proceed
            revert();
        _;
    }

    modifier isWallet() {
        if (msg.sender != wallet)
            // Only wallet is allowed to proceed
            revert();
        _;
    }

    modifier isSetUp() {
        if (address(token) == 0)
            // Contract is not set up
            revert();
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Constructor function sets contract owner and wallet address, which is allowed to withdraw all tokens anytime
    /// @param _receiver Receiver of vested tokens
    /// @param _wallet Gnosis multisig wallet address
    /// @param _disbursementPeriod Vesting period in seconds
    /// @param _startDate Start date of disbursement period (cliff)
    function Disbursement(address _receiver, address _wallet, uint _disbursementPeriod, uint _startDate)
        public
    {
        if (_receiver == 0 || _wallet == 0 || _disbursementPeriod == 0)
            // Arguments are null
            revert();
        owner = msg.sender;
        receiver = _receiver;
        wallet = _wallet;
        disbursementPeriod = _disbursementPeriod;
        startDate = _startDate;
        if (startDate == 0)
            startDate = now;
    }

    /// @dev Setup function sets external contracts' addresses
    /// @param _token Token address
    function setup(Token _token)
        public
        isOwner
    {
        if (address(token) != 0 || address(_token) == 0)
            // Setup was executed already or address is null
            revert();
        token = _token;
    }

    /// @dev Transfers tokens to a given address
    /// @param _to Address of token receiver
    /// @param _value Number of tokens to transfer
    function withdraw(address _to, uint256 _value)
        public
        isReceiver
        isSetUp
    {
        uint maxTokens = calcMaxWithdraw();
        if (_value > maxTokens)
            revert();
        withdrawnTokens += _value;
        token.transfer(_to, _value);
    }

    /// @dev Transfers all tokens to multisig wallet
    function walletWithdraw()
        public
        isWallet
        isSetUp
    {
        uint balance = token.balanceOf(this);
        withdrawnTokens += balance;
        token.transfer(wallet, balance);
    }

    /// @dev Calculates the maximum amount of vested tokens
    /// @return Number of vested tokens to withdraw
    function calcMaxWithdraw()
        public
        constant
        returns (uint)
    {
        uint maxTokens = (token.balanceOf(this) + withdrawnTokens) * (now - startDate) / disbursementPeriod;
        if (withdrawnTokens >= maxTokens || startDate > now)
            return 0;
        return maxTokens - withdrawnTokens;
    }
}
