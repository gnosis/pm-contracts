pragma solidity ^0.4.24;

interface OracleConsumer {
    function receiveResult(bytes32 id, bytes32 result) external;
}
