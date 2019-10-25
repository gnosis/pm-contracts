pragma solidity ^0.5.0;
import "../Oracles/Oracle.sol";
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";


interface TellorInterface {
	function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) external returns (bool,uint,uint);
    function requestDataWithEther(uint _requestId) payable external;
    //function requestDataWithEther(string calldata _request, string calldata _symbol, uint256 _granularity, uint256 _tip) external payable;

}



contract TellorOracleProxy is Proxy{

    constructor(address proxied)
        Proxy(proxied)
        public
        {}
}
contract TellorOracle is Oracle,TellorOracleProxy{

    /*
     *  Events
     */
    event OutcomeAssignment(int outcome);

    /*
     *  Storage
     */
    address public tellorContract;
    uint public requestId;
    uint public endDate;
    bool public isSet;
    int public outcome;


    /*
     *  Public functions
     */
    function setTellorContract(address _tellorContract, uint _requestId, uint _endDate)
        public
    {
        // Result is not set yet
        require(!isSet);
        require(_tellorContract == address(0));
        require(_requestId != 0);
        require(_tellorContract != address(0));
        require(_endDate > now);
        tellorContract = _tellorContract;
        requestId = _requestId;
        endDate = _endDate;
    }

    /// @dev Sets event outcome
    function setOutcome()
        public
    {
        // Result is not set yet
        require(!isSet);
        require(requestId != 0);
        bool _didGet;
        uint _value;
        uint _time;
        (_didGet,_value,_time) = TellorInterface(tellorContract).getFirstVerifiedDataAfter(requestId,endDate);
        if(_didGet){
        	outcome = _value;
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
