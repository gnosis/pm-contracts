pragma solidity ^0.4.15;
import "../Utils/Proxy.sol";

/// @title Abstract oracle contract - Functions to be implemented by oracles
contract Oracle {

    function isOutcomeSet() public view returns (bool);
    function getOutcome() public view returns (int);
}
