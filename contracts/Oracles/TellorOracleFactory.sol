pragma solidity ^0.5.0;
import "../Oracles/TellorOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract TellorOracleFactory {

    /*
     *  Events
     */
    event TellorOracleCreation(address indexed creator, TellorOracle tellorOracle, bytes ipfsHash);

    /*
     *  Storage
     */
    TellorOracle public tellorOracleMasterCopy;

    /*
     *  Public functions
     */
    constructor(TellorOracle _tellorOracleMasterCopy)
        public
    {
        tellorOracleMasterCopy = _tellorOracleMasterCopy;
    }

    /// @dev Creates a new centralized oracle contract
    /// @param ipfsHash Hash identifying off chain event description
    /// @return Oracle contract
    function createTellorOracle(bytes memory ipfsHash)
        public
        returns (TellorOracle tellorOracle)
    {
        tellorOracle = TellorOracle(address(new TellorOracleProxy(address(tellorOracleMasterCopy), msg.sender, ipfsHash)));
        emit TellorOracleCreation(msg.sender, tellorOracle, ipfsHash);
    }
}
