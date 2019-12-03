pragma solidity ^0.5.0;
import "../Oracles/TellorFallbackOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
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
