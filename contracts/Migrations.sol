// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.7.0;
import "canonical-weth/contracts/WETH9.sol";
import "./drafts/ERC20Detailed.sol";

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    constructor() {
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
