pragma solidity ^0.5.0;
import "../Oracles/Oracle.sol";


contract TellorOracle is Oracle{

    /*
     *  Events
     */
    event OwnerReplacement(address indexed newOwner);
    event OutcomeAssignment(int outcome);

    /*
     *  Storage
     */
    address public owner;
    bytes public ipfsHash;
    bool public isSet;
    int public outcome;


    /*
     *  Public functions
     */
    /// @dev Replaces owner
    /// @param newOwner New owner
    function replaceOwner(address newOwner)
        public
        isOwner
    {
        // Result is not set yet
        require(!isSet);
        owner = newOwner;
        emit OwnerReplacement(newOwner);
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
        emit OutcomeAssignment(_outcome);
    }

    /// @dev Returns if winning outcome is set
    /// @return Is outcome set?
    function isOutcomeSet()
        public
        view
        returns (bool)
    {
        return isSet;
    }

    /// @dev Returns outcome
    /// @return Outcome
    function getOutcome()
        public
        view
        returns (int)
    {
        return outcome;
    }
}
