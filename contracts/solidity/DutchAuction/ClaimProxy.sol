pragma solidity 0.4.11;
import "AbstractDutchAuction.sol";


/// @title Claim proxy contract - allows to claim GNO tokens for multiple receivers at once
/// @author Stefan George - <stefan@gnosis.pm>
contract ClaimProxy {

    /*
     *  Storage
     */
    DutchAuction public dutchAuction;

    /*
     *  Public functions
     */
    /// @dev Contract constructor function dutch auction contract address
    /// @param _dutchAuction Dutch auction address
    function ClaimProxy(DutchAuction _dutchAuction)
        public
    {
        if (address(_dutchAuction) == 0)
            // Address should not be null
            revert();
        dutchAuction = _dutchAuction;
    }

    /// @dev Allows to claim GNO on behalf of bidders
    /// @param receivers Array of bidder addresses
    function claimTokensFor(address[] receivers)
        public
    {
        for (uint i=0; i<receivers.length; i++)
            dutchAuction.claimTokens(receivers[i]);
    }
}
