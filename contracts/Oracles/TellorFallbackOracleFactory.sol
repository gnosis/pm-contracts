pragma solidity ^0.5.0;
import "../Oracles/TellorFallbackOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Nicholas Fett - <nfett@tellor.io>
contract TellorFallbackOracleFactory {

    /*
     *  Events
     */
    event TellorFallbackOracleCreation(address indexed creator, TellorFallbackOracle tellorFallbackOracle);

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
    /// @param _tellorContract is the Tellor UserContract that should be used by the interface
    /// @param _disputePeriod is the period when disputes are allowed
    /// @param _requestId is the request ID for the type of data that is will be used by the contract
    /// @param _endDate is the contract/market end date or the date to use for getFirstVerifiedDataAfter
    /// @param _disputeCost is the cost in ETH to dispute a val
    /// @return Oracle contract
    function createTellorFallbackOracle(address payable _tellorContract,uint _disputePeriod, uint _requestId, uint _endDate, uint _disputeCost)
        public
        returns (TellorFallbackOracle tellorFallbackOracle)
    {
        tellorFallbackOracle = TellorFallbackOracle(address(new TellorFallbackOracleProxy(
            address(tellorFallbackOracleMasterCopy),msg.sender, _tellorContract,_disputePeriod,_requestId,_endDate,_disputeCost)));

        emit TellorFallbackOracleCreation(msg.sender, tellorFallbackOracle);
    }
}
