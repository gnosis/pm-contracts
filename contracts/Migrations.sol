pragma solidity ^0.4.24;

// HACK: should be removed along with the hack-ey migration
// when https://github.com/trufflesuite/truffle/pull/1085 hits
import "canonical-weth/contracts/WETH9.sol";

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
