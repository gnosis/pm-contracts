pragma solidity 0.4.18;
import "../Utils/Proxy.sol";


/// @title Abstract oracle contract - Functions to be implemented by oracles
contract Oracle is Proxied {

    function isOutcomeSet() public view returns (bool);
    function getOutcome() public view returns (int);
}
