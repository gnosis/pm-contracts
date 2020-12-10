// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.7.0;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";


contract OutcomeTokenProxy is Proxy {
    /*
     *  Storage
     */

    // HACK: Lining up storage with StandardToken and OutcomeToken
    mapping(address => uint256) balances;
    uint256 totalSupply_;
    mapping (address => mapping (address => uint256)) internal allowed;

    address internal eventContract;

    /*
     *  Public functions
     */
    /// @dev Constructor sets events contract address
    constructor(address proxied)
        Proxy(proxied)
    {
        eventContract = msg.sender;
    }
}

/// @title Outcome token contract - Issuing and revoking outcome tokens
/// @author Stefan George - <stefan@gnosis.pm>
abstract contract OutcomeToken is Proxied, ERC20 {
    using SafeMath for *;

    /*
     *  Events
     */
    event Issuance(address indexed owner, uint amount);
    event Revocation(address indexed owner, uint amount);

    /*
     *  Storage
     */
    address public eventContract;

    /*
     *  Modifiers
     */
    modifier isEventContract () {
        // Only event contract is allowed to proceed
        require(msg.sender == eventContract);
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Events contract issues new tokens for address. Returns success
    /// @param _for Address of receiver
    /// @param outcomeTokenCount Number of tokens to issue
    function issue(address _for, uint outcomeTokenCount)
        public
        isEventContract
    {
        _mint(_for, outcomeTokenCount);
        emit Issuance(_for, outcomeTokenCount);
    }

    /// @dev Events contract revokes tokens for address. Returns success
    /// @param _for Address of token holder
    /// @param outcomeTokenCount Number of tokens to revoke
    function revoke(address _for, uint outcomeTokenCount)
        public
        isEventContract
    {
        _burn(_for, outcomeTokenCount);
        emit Revocation(_for, outcomeTokenCount);
    }
}
