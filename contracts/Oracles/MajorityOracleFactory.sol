pragma solidity ^0.5.0;
import "../Oracles/MajorityOracle.sol";


/// @title Majority oracle factory contract - Allows to create majority oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract MajorityOracleFactory {

    /*
     *  Events
     */
    event MajorityOracleCreation(address indexed creator, MajorityOracle majorityOracle, Oracle[] oracles);

    /*
     *  Storage
     */
    MajorityOracle public majorityOracleMasterCopy;

    /*
     *  Public functions
     */
    constructor(MajorityOracle _majorityOracleMasterCopy)
        public
    {
        majorityOracleMasterCopy = _majorityOracleMasterCopy;
    }

    /// @dev Creates a new majority oracle contract
    /// @param oracles List of oracles taking part in the majority vote
    /// @return Oracle contract
    function createMajorityOracle(Oracle[] memory oracles)
        public
        returns (MajorityOracle majorityOracle)
    {
        majorityOracle = MajorityOracle(address(new MajorityOracleProxy(address(majorityOracleMasterCopy), oracles)));
        emit MajorityOracleCreation(msg.sender, majorityOracle, oracles);
    }
}
