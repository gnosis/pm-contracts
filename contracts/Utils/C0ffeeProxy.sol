pragma solidity 0.4.15;

/// @title Magic c0ffee proxy
/// @author Stefan George - <stefan@gnosis.pm>
/// @author Alan Lu - <alan.lu@gnosis.pm>
contract C0ffeeProxy {
    // event ProxyCall(address indexed sender, address dest);

    function ()
        external
        payable
    {
        // ProxyCall(msg.sender, 0xc0ffeecafec0ffeecafec0ffeecafec0ffeecafe);
        assembly {
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(not(0), 0xc0ffeecafec0ffeecafec0ffeecafec0ffeecafe, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch success
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}

contract IceIceProxy {
    // event ProxyCall(address indexed sender, address dest);

    function ()
        external
        payable
    {
        // ProxyCall(msg.sender, 0x1ce1cebabe1ce1cebabe1ce1cebabe1ce1cebabe);
        assembly {
            calldatacopy(0, 0, calldatasize())
            let success := delegatecall(not(0), 0x1ce1cebabe1ce1cebabe1ce1cebabe1ce1cebabe, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch success
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}