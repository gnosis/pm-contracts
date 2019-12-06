pragma solidity ^0.5.0;
import "../Oracles/Oracle.sol";
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";


interface TellorInterface {
	function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) external returns (bool,uint,uint);
}


contract TellorOracleData{
    /*
     *  Events
     */
    event OutcomeAssignment(int outcome);

    /*
     *  Storage
     */
    address payable public tellorContract;
    uint public requestId;
    uint public endDate;
    bool public isSet;
    int public outcome;
}

contract TellorOracleProxy is Proxy,TellorOracleData{

    /// @dev Sets the tellor contract, dispute period, type of data(requestId), end date and dispute cost
    /// @param _proxied address
    /// @param _tellorContract is the Tellor user contract that should be used by the interface
    /// @param _requestId is the request ID for the type of data that is will be used by the contract
    /// @param _endDate is the contract/maket end date
    constructor(address proxied,address payable _tellorContract, uint _requestId, uint _endDate) 
        public
        Proxy(proxied) 
    {
        require(_requestId != 0, "Use a valid _requestId, it should not be zero");
        require(_tellorContract != address(0), "_tellorContract address should not be 0");
        require(_endDate > now, "_endDate is not greater than now");
        tellorContract = _tellorContract;
        requestId = _requestId;
        endDate = _endDate;
    }
}

contract TellorOracle is Proxied, Oracle,TellorOracleData{

    /*
     *  Public functions
     */
    /// @dev Sets event outcome
    function setOutcome()
        public
    {
        // Result is not set yet
        require(!isSet, "The outcome is already set");
        bool _didGet;
        uint _value;
        uint _time;
        (_didGet,_value,_time) = TellorInterface(tellorContract).getFirstVerifiedDataAfter(requestId,endDate);
        if(_didGet){
        	outcome = int(_value);
        	isSet = true;
        	emit OutcomeAssignment(outcome);
        }
    }

    /// @dev Returns if winning outcome is set
    /// @return Is outcome set?
    function isOutcomeSet()
        public
        view
        returns (bool)
    {
        return isSet;
    }

    /// @dev Returns outcome
    /// @return Outcome
    function getOutcome()
        public
        view
        returns (int)
    {
        return outcome;
    }
}
