pragma solidity ^0.5.0;
import "../Oracles/TellorOracle.sol";


/// @title Centralized oracle factory contract - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract TellorOracleFactory {

    /*
     *  Events
     */
    event TellorOracleCreation(address indexed creator, TellorOracle tellorOracle);

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
    /// @return Oracle contract
    function createTellorOracle(address payable _tellorContract, uint _requestId, uint _endDate)
        public
        returns (TellorOracle tellorOracle)
    {
        tellorOracle = TellorOracle(address(new TellorOracleProxy(address(tellorOracleMasterCopy), _tellorContract,_requestId,_endDate)));
        emit TellorOracleCreation(msg.sender, tellorOracle);
    }
}
