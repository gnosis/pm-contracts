pragma solidity ^0.4.2;

// HACK: by importing these contracts, artifacts for them will be generated in build/
// so they can be part of the package ultimately
import "@gnosis.pm/util-contracts/contracts/HumanFriendlyToken.sol";
import "@gnosis.pm/util-contracts/contracts/EtherToken.sol";

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function Migrations() public {
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
