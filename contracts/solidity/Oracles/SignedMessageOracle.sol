pragma solidity 0.4.11;
import "Oracles/AbstractOracle.sol";


/// @title Signed message oracle contract - Allows to set an outcome with a signed message
/// @author Stefan George - <stefan@gnosis.pm>
contract SignedMessageOracle is Oracle {

    /*
     *  Storage
     */
    address public signer;
    bytes32 public descriptionHash;
    uint nonce;
    bool public isSet;
    int public outcome;

    /*
     *  Modifiers
     */
    modifier isSigner () {
        if (msg.sender != signer)
            // Only signer is allowed to proceed
            revert();
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Constructor sets signer address based on signature
    /// @param _descriptionHash Hash identifying off chain event description
    /// @param v Signature parameter
    /// @param r Signature parameter
    /// @param s Signature parameter
    function SignedMessageOracle(bytes32 _descriptionHash, uint8 v, bytes32 r, bytes32 s)
        public
    {
        signer = ecrecover(_descriptionHash, v, r, s);
        descriptionHash = _descriptionHash;
    }

    /// @dev Replaces signer
    /// @param _signer New signer
    /// @param _nonce Unique nonce to prevent replay attacks
    /// @param v Signature parameter
    /// @param r Signature parameter
    /// @param s Signature parameter
    function replaceSigner(address _signer, uint _nonce, uint8 v, bytes32 r, bytes32 s)
        public
        isSigner
    {
        if (   isSet
            || nonce >= _nonce
            || signer != ecrecover(keccak256(descriptionHash, _signer, _nonce), v, r, s))
            // Result was set already or nonce is invalid or singer is invalid
            revert();
        nonce = _nonce;
        signer = _signer;
    }

    /// @dev Sets outcome based on signed message
    /// @param _outcome Signed event outcome
    /// @param v Signature parameter
    /// @param r Signature parameter
    /// @param s Signature parameter
    function setOutcome(int _outcome, uint8 v, bytes32 r, bytes32 s)
        public
    {
        address _signer = ecrecover(keccak256(descriptionHash, _outcome), v, r, s);
        if (isSet || _signer != signer)
            // Result was set already or result was not signed by registered signer
            revert();
        isSet = true;
        outcome = _outcome;
    }

    /// @dev Returns if winning outcome is set for given event
    /// @return Returns if outcome is set
    function isOutcomeSet()
        public
        constant
        returns (bool)
    {
        return isSet;
    }

    /// @dev Returns winning outcome for given event
    /// @return Returns outcome
    function getOutcome()
        public
        constant
        returns (int)
    {
        return outcome;
    }
}
