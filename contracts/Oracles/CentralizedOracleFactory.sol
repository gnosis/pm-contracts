pragma solidity ^0.4.25;
import "../Oracles/CentralizedOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract CentralizedOracleFactory {

    /*
     *  Events
     */
    event CentralizedOracleCreation(address indexed creator, CentralizedOracle centralizedOracle, bytes ipfsHash);

    /*
     *  Storage
     */
    CentralizedOracle public centralizedOracleMasterCopy;

    /*
     *  Public functions
     */
    constructor(CentralizedOracle _centralizedOracleMasterCopy)
        public
    {
        centralizedOracleMasterCopy = _centralizedOracleMasterCopy;
    }

    /// @dev Creates a new centralized oracle contract
    /// @param ipfsHash Hash identifying off chain event description
    /// @return Oracle contract
    function createCentralizedOracle(bytes ipfsHash)
        public
        returns (CentralizedOracle centralizedOracle)
    {
        centralizedOracle = CentralizedOracle(new CentralizedOracleProxy(centralizedOracleMasterCopy, msg.sender, ipfsHash));
        emit CentralizedOracleCreation(msg.sender, centralizedOracle, ipfsHash);
    }
}
