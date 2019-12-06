pragma solidity ^0.5.0;
import "../Oracles/TellorOracle.sol";


/// @title Tellor oracle factory contract - Allows to create tellor oracle contracts
/// @author Brenda Loya- <stefan@gnosis.pm>
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
    /// @param _tellorContract is the Tellor user contract that should be used by the interface
    /// @param _requestId is the request ID for the type of data that is will be used by the contract
    /// @param _endDate is the contract/market end date or the date to use for getFirstVerifiedDataAfter
    /// @return Oracle contract
    function createTellorOracle(address payable _tellorContract, uint _requestId, uint _endDate)
        public
        returns (TellorOracle tellorOracle)
    {
        tellorOracle = TellorOracle(address(new TellorOracleProxy(address(tellorOracleMasterCopy), _tellorContract,_requestId,_endDate)));
        emit TellorOracleCreation(msg.sender, tellorOracle);
    }
}
