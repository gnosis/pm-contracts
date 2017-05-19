pragma solidity 0.4.11;
import "Tokens/AbstractToken.sol";


/// @title Dutch auction contract - distribution of Gnosis tokens using an auction
/// @author Stefan George - <stefan@gnosis.pm>
contract DutchAuction {

    /*
     *  Events
     */
    event BidSubmission(address indexed sender, uint256 amount);

    /*
     *  Constants
     */
    uint constant public MAX_TOKENS_SOLD = 9000000 * 10**18; // 9M
    uint constant public WAITING_PERIOD = 7 days;

    /*
     *  Storage
     */
    Token public gnosisToken;
    address public wallet;
    address public owner;
    uint public ceiling;
    uint public priceFactor;
    uint public startBlock;
    uint public endTime;
    uint public totalReceived;
    uint public finalPrice;
    mapping (address => uint) public bids;
    Stages public stage;

    enum Stages {
        AuctionDeployed,
        AuctionSetUp,
        AuctionStarted,
        AuctionEnded,
        TradingStarted
    }

    /*
     *  Modifiers
     */
    modifier atStage(Stages _stage) {
        if (stage != _stage)
            // Contract not in expected state
            revert();
        _;
    }

    modifier isOwner() {
        if (msg.sender != owner)
            // Only owner is allowed to proceed
            revert();
        _;
    }

    modifier isWallet() {
        if (msg.sender != wallet)
            // Only wallet is allowed to proceed
            revert();
        _;
    }

    modifier isValidPayload(address receiver) {
        if (   msg.data.length != 4 && msg.data.length != 36
            || receiver == address(this)
            || receiver == address(gnosisToken))
            // Payload length has to have correct length and receiver should not be dutch auction or gnosis token contract
            revert();
        _;
    }

    modifier timedTransitions() {
        if (stage == Stages.AuctionStarted && calcTokenPrice() <= calcStopPrice())
            finalizeAuction();
        if (stage == Stages.AuctionEnded && now > endTime + WAITING_PERIOD)
            stage = Stages.TradingStarted;
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Contract constructor function sets owner
    /// @param _wallet Gnosis wallet
    /// @param _ceiling Auction ceiling
    /// @param _priceFactor Auction price factor
    function DutchAuction(address _wallet, uint _ceiling, uint _priceFactor)
        public
    {
        if (_wallet == 0 || _ceiling == 0 || _priceFactor == 0)
            // Arguments are null
            revert();
        owner = msg.sender;
        wallet = _wallet;
        ceiling = _ceiling;
        priceFactor = _priceFactor;
        stage = Stages.AuctionDeployed;
    }

    /// @dev Setup function sets external contracts' addresses
    /// @param _gnosisToken Gnosis token address
    function setup(Token _gnosisToken)
        public
        isOwner
        atStage(Stages.AuctionDeployed)
    {
        if (address(_gnosisToken) == 0)
            // Argument is null
            revert();
        gnosisToken = _gnosisToken;
        // Validate token balance
        if (gnosisToken.balanceOf(this) != MAX_TOKENS_SOLD)
            revert();
        stage = Stages.AuctionSetUp;
    }

    /// @dev Starts auction and sets startBlock
    function startAuction()
        public
        isWallet
        atStage(Stages.AuctionSetUp)
    {
        stage = Stages.AuctionStarted;
        startBlock = block.number;
    }

    /// @dev Changes auction ceiling and start price factor before auction is started
    /// @param _ceiling Updated auction ceiling
    /// @param _priceFactor Updated start price factor
    function changeSettings(uint _ceiling, uint _priceFactor)
        public
        isWallet
        atStage(Stages.AuctionSetUp)
    {
        ceiling = _ceiling;
        priceFactor = _priceFactor;
    }

    /// @dev Calculates current token price
    /// @return Returns token price
    function calcCurrentTokenPrice()
        public
        timedTransitions
        returns (uint)
    {
        if (stage == Stages.AuctionEnded || stage == Stages.TradingStarted)
            return finalPrice;
        return calcTokenPrice();
    }

    /// @dev Returns correct stage, even if a function with timedTransitions modifier has not yet been called yet
    /// @return Returns current auction stage
    function updateStage()
        public
        timedTransitions
        returns (Stages)
    {
        return stage;
    }

    /// @dev Allows to send a bid to the auction
    /// @param receiver Bid will be assigned to this address if set
    function bid(address receiver)
        public
        payable
        isValidPayload(receiver)
        timedTransitions
        atStage(Stages.AuctionStarted)
        returns (uint amount)
    {
        // If a bid is done on behalf of a user via ShapeShift, the receiver address is set
        if (receiver == 0)
            receiver = msg.sender;
        amount = msg.value;
        // Prevent that more than 90% of tokens are sold. Only relevant if cap not reached
        uint maxWei = (MAX_TOKENS_SOLD / 10**18) * calcTokenPrice() - totalReceived;
        uint maxWeiBasedOnTotalReceived = ceiling - totalReceived;
        if (maxWeiBasedOnTotalReceived < maxWei)
            maxWei = maxWeiBasedOnTotalReceived;
        // Only invest maximum possible amount
        if (amount > maxWei) {
            amount = maxWei;
            // Send change back to receiver address. In case of a ShapeShift bid the user receives the change back directly
            receiver.transfer(msg.value - amount);
        }
        // Forward funding to ether wallet
        wallet.transfer(amount);
        bids[receiver] += amount;
        totalReceived += amount;
        if (maxWei == amount)
            // When maxWei is equal to the big amount the auction is ended and finalizeAuction is triggered
            finalizeAuction();
        BidSubmission(receiver, amount);
    }

    /// @dev Claims tokens for bidder after auction
    /// @param receiver Tokens will be assigned to this address if set
    function claimTokens(address receiver)
        public
        isValidPayload(receiver)
        timedTransitions
        atStage(Stages.TradingStarted)
    {
        if (receiver == 0)
            receiver = msg.sender;
        uint tokenCount = bids[receiver] * 10**18 / finalPrice;
        bids[receiver] = 0;
        gnosisToken.transfer(receiver, tokenCount);
    }

    /// @dev Calculates stop price
    /// @return Returns stop price
    function calcStopPrice()
        constant
        public
        returns (uint)
    {
        return totalReceived * 10**18 / MAX_TOKENS_SOLD + 1;
    }

    /// @dev Calculates token price
    /// @return Returns token price
    function calcTokenPrice()
        constant
        public
        returns (uint)
    {
        return priceFactor * 10**18 / (block.number - startBlock + 7500) + 1;
    }

    /*
     *  Private functions
     */
    function finalizeAuction()
        private
    {
        stage = Stages.AuctionEnded;
        if (totalReceived == ceiling)
            finalPrice = calcTokenPrice();
        else
            finalPrice = calcStopPrice();
        uint soldTokens = totalReceived * 10**18 / finalPrice;
        // Auction contract transfers all unsold tokens to Gnosis inventory multisig
        gnosisToken.transfer(wallet, MAX_TOKENS_SOLD - soldTokens);
        endTime = now;
    }
}
