pragma solidity 0.4.11;
import "Oracles/CentralizedOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract CentralizedOracleFactory {

    /*
     *  Events
     */
    event CentralizedOracleCreation(address indexed creator, uint creationDate, CentralizedOracle centralizedOracle, bytes ipfsHash);

    /*
     *  Public functions
     */
    /// @dev Creates a new centralized oracle contract
    /// @param ipfsHash Hash identifying off chain event description
    /// @return Returns oracle contract
    function createCentralizedOracle(bytes ipfsHash)
        public
        returns (CentralizedOracle centralizedOracle)
    {
        centralizedOracle = new CentralizedOracle(msg.sender, ipfsHash);
        CentralizedOracleCreation(msg.sender, now, centralizedOracle, ipfsHash);
    }
}
