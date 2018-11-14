pragma solidity ^0.4.24;

// HACK: should be removed along with the hack-ey migration
// when https://github.com/trufflesuite/truffle/pull/1085 hits
import "canonical-weth/contracts/WETH9.sol";


contract Migrations {
    address public owner;
    uint public lastCompletedMigration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function setCompleted(uint completed) public restricted {
        lastCompletedMigration = completed;
    }

    function upgrade(address newAddress) public restricted {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }
}
