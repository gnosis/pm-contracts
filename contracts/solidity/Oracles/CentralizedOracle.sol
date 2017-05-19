pragma solidity 0.4.11;
import "Oracles/AbstractOracle.sol";


/// @title Centralized oracle contract - Allows the contract owner to set an outcome
/// @author Stefan George - <stefan@gnosis.pm>
contract CentralizedOracle is Oracle {

    /*
     *  Storage
     */
    address public owner;
    bytes32 public descriptionHash;
    bool public isSet;
    int public outcome;

    /*
     *  Modifiers
     */
    modifier isOwner () {
        if (msg.sender != owner)
            // Only owner is allowed to proceed
            revert();
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Constructor sets owner address and description hash
    /// @param _descriptionHash Hash identifying off chain event description
    function CentralizedOracle(address _owner, bytes32 _descriptionHash)
        public
    {
        if (_descriptionHash == 0)
            // Description hash is null
            revert();
        owner = _owner;
        descriptionHash = _descriptionHash;
    }

    /// @dev Replaces owner
    /// @param _owner New owner
    function replaceOwner(address _owner)
        public
        isOwner
    {
        if (isSet)
            // Result was set already
            revert();
        owner = _owner;
    }

    /// @dev Sets event outcome
    /// @param _outcome Event outcome
    function setOutcome(int _outcome)
        public
        isOwner
    {
        if (isSet)
            // Result was set already
            revert();
        isSet = true;
        outcome = _outcome;
    }

    /// @dev Returns if winning outcome is set for given event
    /// @return Returns if outcome is set
    function isOutcomeSet()
        public
        constant
        returns (bool)
    {
        return isSet;
    }

    /// @dev Returns winning outcome for given event
    /// @return Returns outcome
    function getOutcome()
        public
        constant
        returns (int)
    {
        return outcome;
    }
}
