//This takes an existing oracle and adds a Tellor fallback

//setOutcome takes a dispute period and then can fallback to Tellor

pragma solidity ^0.5.0;
import "../Oracles/Oracle.sol";
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";

interface TellorInterface {
	function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) external returns(bool,uint,uint);
    //function requestDataWithEther(uint _requestId) external payable;
     function addTipWithEtherTipNotSpecified(uint256 _apiId) external payable;
    //function requestDataWithEther(string calldata _request, string calldata _symbol, uint256 _granularity, uint256 _tip) external payable;
}
//Brenda: add this to the user contract or using Tellor
   // function addTipWithEtherTipNotSpecified(uint256 _apiId) external payable {
   //      require(msg.value >= (tributePrice) / 1e18, "Value is too low");
   //      uint _tip = (msg.value)/ (tributePrice) / 1e18;
   //      require(_tellorm.balanceOf(address(this)) >= _tip, "Balance is lower than tip amount");
   //      _tellor.addTip(_apiId, _tip);
   //  }


/// @title Centralized oracle data - Allows to create centralized oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract CentralizedOracleData {

    /*
     *  Events
     */
    event OwnerReplacement(address indexed newOwner);
    event OutcomeAssignment(int outcome);

    /*
     *  Storage
     */
    address public owner;
    bytes public ipfsHash;
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

contract TellorFallbackOracleProxy is Proxy, CentralizedOracleData {

    /// @dev Constructor sets owner address and IPFS hash
    /// @param _ipfsHash Hash identifying off chain event description
    constructor(address proxied, address _owner, bytes memory _ipfsHash)
        public
        Proxy(proxied)
    {
        // Description hash cannot be null
        require(_ipfsHash.length == 46);
        owner = _owner;
        ipfsHash = _ipfsHash;
    }
}

/// @title TellorFallbackOracle - Allows the contract owners to initiate and settle a dispute provided by the centralized oracle
contract TellorFallbackOracle is Proxied, Oracle, CentralizedOracleData {
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
    //TellorInterface tellorInterface;

    /*
     *  Public functions
     */
    /// @dev Replaces owner
    /// @param newOwner New owner
    function replaceOwner(address newOwner)
        public
        isOwner
    {
        // Result is not set yet
        require(!isSet);
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

///should this just be in the constructor? 
    /// @dev Sets the tellor contract, dispute period, type of data(requestId), end date and dispute cost
    /// @param _tellorContract is the Tellor user contract that should be used by the interface
    /// @param _disputePeriod is the period when disputes are allowed
    /// @param _requestId is the request ID for the type of data that is will be used by the contract
    /// @param _endDate is the contract/maket end date  ???
    /// @param _disputeCost is the cost in ETH to dispute a value
    function setTellorContract(address payable _tellorContract,uint _disputePeriod, uint _requestId, uint _endDate, uint _disputeCost)
        public
    {
        require(msg.sender = owner); 
        // Result is not set yet
        require(!isSet, "The outcome is already set");
        require(tellorContract == address(0), "tellorContract address has already been set");
        require(_requestId != 0, "Use a valid _requestId, it should not be zero");
        require(_tellorContract != address(0), "_tellorContract address should not be 0");
        require(_endDate > now, "_endDate is not greater than now");
        tellorContract = _tellorContract;
        requestId = _requestId;
        endDate = _endDate;
        disputeCost = _disputeCost;
        disputePeriod = _disputePeriod;
        //tellorInterface = TellorInterface(_tellorContract);
    }

    /// @dev Allows users to initiate a dispute
    function dispute() public payable{
    	require(msg.value > disputeCost, "The msg.value submitted is not greater than the dispute cost");
    	require(!isDisputed, "The value has already been disputed");
    	isDisputed = true;
    	isSet = false;
    	emit OracleDisputed();

    }

    /// @dev Sets event outcome based on the Tellor Oracle and if the data is not available it requests it
    function setTellorOutcome()
        payable
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
        else{
            //address payable _tellor = address(uint160(address(tellorContract)));
            //TellorInterface tellorInterface = TellorInterface(tellorContract);
        	//TellorInterface(tellorContract).requestDataWithEther(requestId).value(msg.value);
            //tellorInterface.requestDataWithEther(requestId).transfer(msg.value);
            TellorInterface(tellorContract).addTipWithEther(requestId).value(msg.value);
        }
    }
}
