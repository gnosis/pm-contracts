// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.7.0;
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";

/// @title Abstract oracle contract - Functions to be implemented by oracles
abstract contract Oracle {

    function isOutcomeSet() public virtual view returns (bool);
    function getOutcome() public virtual view returns (int);
}
