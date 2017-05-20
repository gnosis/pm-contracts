pragma solidity 0.4.11;
import "Oracles/CentralizedOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract CentralizedOracleFactory {

    /*
     *  Events
     */
    event CentralizedOracleCreation(address indexed creator, uint creationDate, CentralizedOracle centralizedOracle, bytes32 descriptionHash);

    /*
     *  Public functions
     */
    /// @dev Creates a new centralized oracle contract
    /// @param descriptionHash Hash identifying off chain event description
    /// @return Returns oracle contract
    function createCentralizedOracle(bytes32 descriptionHash)
        public
        returns (CentralizedOracle centralizedOracle)
    {
        centralizedOracle = new CentralizedOracle(msg.sender, descriptionHash);
        CentralizedOracleCreation(msg.sender, now, centralizedOracle, descriptionHash);
    }
}
