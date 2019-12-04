//This takes an existing oracle and adds a Tellor fallback

//setOutcome takes a dispute period and then can fallback to Tellor

pragma solidity ^0.5.0;
import "../Oracles/Oracle.sol";
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";

interface TellorInterface {
	  function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) external returns(bool,uint,uint);

}

/// @title Centralized oracle data - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract TellorFallbackOracleData {

    /*
     *  Events
     */
    event OwnerReplacement(address indexed newOwner);
    event OutcomeAssignment(int outcome);
    event OracleDisputed();
    /*
     *  Storage
     */
    address payable public tellorContract;
    uint public requestId;
    uint public endDate;
    uint public disputePeriod;
    uint public setTime;
    uint public disputeCost;
    bool public isDisputed;
    /*
     *  Storage
     */
    address payable public owner;
    bool public isSet;
    int public outcome;

    /*
     *  Modifiers
     */
    modifier isOwner () {
        // Only owner is allowed to proceed
        require(msg.sender == owner);
        _;
    }
}

contract TellorFallbackOracleProxy is Proxy, TellorFallbackOracleData {

        /// @dev Sets the tellor contract, dispute period, type of data(requestId), end date and dispute cost
    /// @param _tellorContract is the Tellor user contract that should be used by the interface
    /// @param _disputePeriod is the period when disputes are allowed
    /// @param _requestId is the request ID for the type of data that is will be used by the contract
    /// @param _endDate is the contract/maket end date  ???
    /// @param _disputeCost is the cost in ETH to dispute a value
    constructor(address proxied, address payable _owner,address payable _tellorContract,uint _disputePeriod, uint _requestId, uint _endDate, uint _disputeCost)
        public
        Proxy(proxied)
    {
        // Description hash cannot be null

        require(_requestId != 0, "Use a valid _requestId, it should not be zero");
        require(_tellorContract != address(0), "_tellorContract address should not be 0");
        require(_endDate > now, "_endDate is not greater than now");
        tellorContract = _tellorContract;
        requestId = _requestId;
        endDate = _endDate;
        disputeCost = _disputeCost;
        disputePeriod = _disputePeriod;
        owner = _owner;
    }
}

/// @title TellorFallbackOracle - Allows the contract owners to initiate and settle a dispute provided by the centralized oracle
contract TellorFallbackOracle is Proxied, Oracle, TellorFallbackOracleData {

    /*
     *  Public functions
     */
    /// @dev Replaces owner
    /// @param newOwner New owner
    function replaceOwner(address payable newOwner)
        public
        isOwner
    {
        owner = newOwner;
        emit OwnerReplacement(newOwner);
    }

    /// @dev Sets event outcome
    /// @param _outcome Event outcome
    function setOutcome(int _outcome)
        public
        isOwner
    {
        // Result is not set yet
        require(!isSet);
        setTime = now; 
        isSet = true;
        outcome = _outcome;
        emit OutcomeAssignment(_outcome);
    }

    /// @dev Returns if winning outcome is set
    /// @return Is outcome set?
    function isOutcomeSet()
        public
        view
        returns (bool)
    {
    	if (now > setTime + disputePeriod /*+ duration*/){
    		return isSet;
    	}
    	else{
    		return false;
    	}

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


    /// @dev Allows users to initiate a dispute
    function dispute() public payable{
    	require(msg.value >= disputeCost, "The msg.value submitted is not greater than the dispute cost");
    	require(!isDisputed, "The value has already been disputed");
    	isDisputed = true;
    	isSet = false;
    	emit OracleDisputed();

    }

    /// @dev Sets event outcome based on the Tellor Oracle and if the data is not available it requests it
    function setTellorOutcome()
        public 
    {
        // Result is not set yet
        require(!isSet, "The outcome is already set");
        require(isDisputed, "This is not under dispute");
        require(requestId != 0, "Use a valid _requestId, it should not be zero");
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

    function withdraw()
        public{
            if(isSet){
                owner.transfer(address(this).balance);
            }
        }
}
