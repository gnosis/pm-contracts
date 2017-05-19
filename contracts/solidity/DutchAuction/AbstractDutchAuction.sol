pragma solidity 0.4.11;
import "Tokens/AbstractToken.sol";


/// @title Abstract dutch auction contract - Functions to be implemented by dutch auction contracts
contract DutchAuction {

    function bid(address receiver) payable returns (uint);
    function claimTokens(address receiver);
    function stage() returns (uint);
    function calcTokenPrice() constant returns (uint);
    Token public gnosisToken;
}
