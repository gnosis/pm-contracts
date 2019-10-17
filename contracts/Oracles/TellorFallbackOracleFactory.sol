pragma solidity ^0.5.0;
import "../Oracles/TellorFallbackOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract TellorFallbackOracleFactory {

    /*
     *  Events
     */
    event TellorFallbackOracleCreation(address indexed creator, TellorFallbackOracle tellorFallbackOracle, bytes ipfsHash);

    /*
     *  Storage
     */
    TellorFallbackOracle public tellorFallbackOracleMasterCopy;

    /*
     *  Public functions
     */
    constructor(TellorFallbackOracle _tellorFallbackOracleMasterCopy)
        public
    {
        tellorFallbackOracleMasterCopy = _tellorFallbackOracleMasterCopy;
    }

    /// @dev Creates a new centralized oracle contract
    /// @param ipfsHash Hash identifying off chain event description
    /// @return Oracle contract
    function createTellorFallbackOracle(bytes memory ipfsHash)
        public
        returns (TellorFallbackOracle tellorFallbackOracle)
    {
        tellorFallbackOracle = TellorFallbackOracle(address(new TellorFallbackOracleProxy(address(tellorFallbackOracleMasterCopy), msg.sender, ipfsHash)));
        emit TellorFallbackOracleCreation(msg.sender, tellorFallbackOracle, ipfsHash);
    }
}
