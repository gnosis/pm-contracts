pragma solidity 0.4.11;
import "Oracles/AbstractOracle.sol";


/// @title Difficulty oracle contract - Oracle to resolve difficulty events at given block
/// @author Stefan George - <stefan@gnosis.pm>
contract DifficultyOracle is Oracle {

    /*
     *  Storage
     */
    uint public blockNumber;
    int public outcome;

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets target block number
    /// @param _blockNumber Target block number
    function DifficultyOracle(uint _blockNumber)
        public
    {
        if (_blockNumber < block.number)
            // Block is in the past
            revert();
        blockNumber = _blockNumber;
    }

    /// @dev Sets difficulty as winning outcome for specified block
    function setOutcome()
        public
    {
        if (block.number < blockNumber || outcome != 0)
            // Block number was not reached yet or it was set already
            revert();
        outcome = int(block.difficulty);
    }

    /// @dev Returns if difficulty is set
    /// @return Returns if outcome is set
    function isOutcomeSet()
        public
        constant
        returns (bool)
    {
        // Difficulty is always bigger than 0
        return outcome > 0;
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
