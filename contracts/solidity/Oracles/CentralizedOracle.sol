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
        // Only owner is allowed to proceed
        require(msg.sender == owner);
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
        // Description hash cannot be null
        require(_descriptionHash != 0);
        owner = _owner;
        descriptionHash = _descriptionHash;
    }

    /// @dev Replaces owner
    /// @param _owner New owner
    function replaceOwner(address _owner)
        public
        isOwner
    {
        // Result is not set yet
        require(!isSet);
        owner = _owner;
    }

    /// @dev Sets event outcome
    /// @param _outcome Event outcome
    function setOutcome(int _outcome)
        public
        isOwner
    {
        // Result is not set yet
        require(!isSet);
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
