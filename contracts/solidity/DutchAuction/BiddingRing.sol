pragma solidity 0.4.11;
import "Tokens/AbstractToken.sol";
import "AbstractDutchAuction.sol";


/// @title Bidding ring contract - allows participants to coordinate around one price and bid together
/// @author Stefan George - <stefan@gnosis.pm>
contract BiddingRing {

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
    uint public maxPrice;
    uint public totalContributions;
    uint public totalTokens;
    uint public totalBalance;
    mapping (address => uint) public contributions;
    mapping (address => bool) public tokensSent;
    Stages public stage;

    enum Stages {
        ContributionsCollection,
        ContributionsSent,
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
    /// @dev Constructor sets dutch auction and gnosis token address and max price paid by the bidding ring
    /// @param _dutchAuction Address of dutch auction contract
    /// @param _maxPrice Maximum price paid by participants
    function BiddingRing(DutchAuction _dutchAuction, uint _maxPrice)
        public
    {
        if (address(_dutchAuction) == 0 || _maxPrice == 0)
            revert();
        dutchAuction = _dutchAuction;
        gnosisToken = dutchAuction.gnosisToken();
        if (address(gnosisToken) == 0)
            revert();
        maxPrice = _maxPrice;
        stage = Stages.ContributionsCollection;
    }

    /// @dev Collects ether and updates contributions
    function contribute()
        public
        payable
        atStage(Stages.ContributionsCollection)
    {
        contributions[msg.sender] += msg.value;
        totalContributions += msg.value;
        BidSubmission(msg.sender, msg.value);
    }

    /// @dev Refunds ether and updates contributions
    function refund()
        public
        atStage(Stages.ContributionsCollection)
    {
        uint contribution = contributions[msg.sender];
        contributions[msg.sender] = 0;
        totalContributions -= contribution;
        RefundReceived(msg.sender, contribution);
        msg.sender.transfer(contribution);
    }

    /// @dev Allows to send the collected ether to the auction contract when max price is reached
    function bidProxy()
        public
        atStage(Stages.ContributionsCollection)
    {
        // Check auction has started and price is below max price
        if (dutchAuction.stage() != AUCTION_STARTED || dutchAuction.calcTokenPrice() > maxPrice)
            revert();
        // Send all money to auction contract
        stage = Stages.ContributionsSent;
        dutchAuction.bid.value(this.balance)(0);
    }

    /// @dev Allows to claim all tokens for the proxy contract
    function claimProxy()
        public
        atStage(Stages.ContributionsSent)
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
