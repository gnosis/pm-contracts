pragma solidity 0.4.11;
import "Tokens/AbstractToken.sol";
import "AbstractDutchAuction.sol";


/// @title Proxy sender contract - allows to participate in the auction by sending ETH to the contract
/// @author Stefan George - <stefan@gnosis.pm>
contract ProxySender {

    /*
     *  Events
     */
    event BidSubmission(address indexed sender, uint256 amount);
    event RefundReceived(address indexed sender, uint256 amount);

    /*
     *  Constants
     */
    uint public constant AUCTION_STARTED = 2;
    uint public constant TRADING_STARTED = 4;

    /*
     *  Storage
     */
    DutchAuction public dutchAuction;
    Token public gnosisToken;
    uint totalContributions;
    uint totalTokens;
    uint totalBalance;
    mapping (address => uint) contributions;
    mapping (address => bool) public tokensSent;
    Stages public stage;

    enum Stages {
        ContributionsCollection,
        TokensClaimed
    }

    /*
     *  Modifiers
     */
    modifier atStage(Stages _stage) {
        if (stage != _stage)
            revert();
        _;
    }

    /// @dev Fallback function allows to submit a bid and transfer tokens later on
    function()
        payable
    {
        if (msg.sender == address(dutchAuction))
            RefundReceived(this, msg.value);
        else if (stage == Stages.ContributionsCollection)
            contribute();
        else if (stage == Stages.TokensClaimed)
            transferTokens();
        else
            revert();
    }

    /*
     *  Public functions
     */
    /// @dev Constructor sets dutch auction and gnosis token address
    /// @param _dutchAuction Address of dutch auction contract
    function ProxySender(DutchAuction _dutchAuction)
        public
    {
        if (address(_dutchAuction) == 0)
            revert();
        dutchAuction = _dutchAuction;
        gnosisToken = dutchAuction.gnosisToken();
        stage = Stages.ContributionsCollection;
    }

    /// @dev Forwards ETH to the auction contract and updates contributions
    function contribute()
        public
        payable
        atStage(Stages.ContributionsCollection)
    {
        // Check auction has started
        if (dutchAuction.stage() != AUCTION_STARTED)
            revert();
        contributions[msg.sender] += msg.value;
        totalContributions += msg.value;
        dutchAuction.bid.value(this.balance)(0);
        BidSubmission(msg.sender, msg.value);
    }

    /// @dev Allows to claim all tokens for the proxy contract
    function claimProxy()
        public
        atStage(Stages.ContributionsCollection)
    {
        // Auction is over
        if (dutchAuction.stage() != TRADING_STARTED)
            revert();
        dutchAuction.claimTokens(0);
        totalTokens = gnosisToken.balanceOf(this);
        totalBalance = this.balance;
        stage = Stages.TokensClaimed;
    }

    /// @dev Transfers tokens to the participant
    /// @return Returns token amount
    function transferTokens()
        public
        atStage(Stages.TokensClaimed)
        returns (uint amount)
    {
        if (tokensSent[msg.sender])
            revert();
        tokensSent[msg.sender] = true;
        // Calc. percentage of tokens for sender
        amount = totalTokens * contributions[msg.sender] / totalContributions;
        gnosisToken.transfer(msg.sender, amount);
    }

    /// @dev Transfers refunds to the participant
    /// @return Returns refund amount
    function transferRefunds()
        public
        atStage(Stages.TokensClaimed)
        returns (uint amount)
    {
        if (!tokensSent[msg.sender])
            revert();
        uint contribution = contributions[msg.sender];
        contributions[msg.sender] = 0;
        // Calc. percentage of tokens for sender
        amount = totalBalance * contribution / totalContributions;
        msg.sender.transfer(amount);
    }
}
