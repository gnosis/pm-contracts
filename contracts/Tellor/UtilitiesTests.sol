pragma solidity ^0.5.0;

import "./libraries/Utilities.sol";
import "./libraries/TellorGettersLibrary.sol";
import "./TellorMaster.sol";

/**
* @title Utilities Tests
* @dev These are the getter function for the two assembly code functions in the
* Utilities library
*/
contract UtilitiesTests {
    address internal owner;
    TellorMaster internal tellorMaster;
    address public tellorMasterAddress;

    /**
    * @dev The constructor sets the owner
    */
    constructor() public {
        owner = msg.sender;
    }

    /**
    *@dev Set TellorMaster address
    *@param _TellorMasterAddress is the Tellor Master address
    */
    function setTellorMaster(address payable _TellorMasterAddress) public {
        require(msg.sender == owner, "Sender is not owner");
        tellorMasterAddress = _TellorMasterAddress;
        tellorMaster = TellorMaster(_TellorMasterAddress);
    }

    function testgetMax() public view returns (uint256 _max, uint256 _index) {
        uint256[51] memory requests = tellorMaster.getRequestQ();
        (_max, _index) = Utilities.getMax(requests);
    }

    function testgetMin() public view returns (uint256 _min, uint256 _index) {
        uint256[51] memory requests = tellorMaster.getRequestQ();
        (_min, _index) = Utilities.getMin(requests);
    }

}
