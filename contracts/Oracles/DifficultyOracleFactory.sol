pragma solidity 0.4.15;
import "../Oracles/DifficultyOracle.sol";


/// @title Difficulty oracle factory contract - Allows to create difficulty oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract DifficultyOracleFactory {

    /*
     *  Events
     */
    event DifficultyOracleCreation(address indexed creator, DifficultyOracle difficultyOracle, uint blockNumber);

    /*
     *  Storage
     */
    DifficultyOracle public difficultyOracleMasterCopy;

    /*
     *  Public functions
     */
    function DifficultyOracleFactory(DifficultyOracle _difficultyOracleMasterCopy)
        public
    {
        difficultyOracleMasterCopy = _difficultyOracleMasterCopy;
    }

    /// @dev Creates a new difficulty oracle contract
    /// @param blockNumber Target block number
    /// @return Oracle contract
    function createDifficultyOracle(uint blockNumber)
        public
        returns (DifficultyOracle difficultyOracle)
    {
        difficultyOracle = DifficultyOracle(new DifficultyOracleProxy(difficultyOracleMasterCopy, blockNumber));
        DifficultyOracleCreation(msg.sender, difficultyOracle, blockNumber);
    }
}
