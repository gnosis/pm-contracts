pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../Events/Event.sol";
import "../Utils/Math.sol";


/// @title LMSR market maker contract - Calculates share prices based on share distribution and initial funding
/// @author Alan Lu - <alan.lu@gnosis.pm>
contract LMSRMarketMaker {
    using SafeMath for *;

    /*
     *  Events
     */
    event AutomatedMarketMakerFunding(uint funding);
    event AutomatedMarketMakerClosing();
    event FeeWithdrawal(uint fees);
    event OutcomeTokenTrade(address indexed transactor, int[] outcomeTokenAmounts, int outcomeTokenNetCost, uint marketFees);

    /*
     *  Storage
     */
    address public creator;
    uint public createdAtBlock;
    Event public eventContract;
    uint64 public fee;
    uint public funding;
    int[] public netOutcomeTokensSold;
    Stages public stage;

    enum Stages {
        MarketCreated,
        MarketFunded,
        MarketClosed
    }

    /*
     *  Constants
     */
    uint constant ONE = 0x10000000000000000;
    int constant EXP_LIMIT = 3394200909562557497344;
    uint64 public constant FEE_RANGE = 10**18;

    /*
     *  Modifiers
     */
    modifier isCreator() {
        // Only creator is allowed to proceed
        require(msg.sender == creator);
        _;
    }

    modifier atStage(Stages _stage) {
        // Contract has to be in given stage
        require(stage == _stage);
        _;
    }

    /*
     *  Public functions
     */
    constructor(address _creator, Event _eventContract, uint64 _fee)
        public
    {
        // Validate inputs
        require(address(_eventContract) != 0 && _fee < FEE_RANGE);
        creator = _creator;
        createdAtBlock = block.number;
        eventContract = _eventContract;
        netOutcomeTokensSold = new int[](eventContract.getOutcomeCount());
        fee = _fee;
        stage = Stages.MarketCreated;
    }


    /// @dev Calculates the net cost for executing a given trade.
    /// @param outcomeTokenAmounts Amounts of outcome tokens to buy from the market. If an amount is negative, represents an amount to sell to the market.
    /// @return Net cost of trade. If positive, represents amount of collateral which would be paid to the market for the trade. If negative, represents amount of collateral which would be received from the market for the trade.
    function calcNetCost(int[] outcomeTokenAmounts)
        public
        view
        returns (int netCost)
    {
        require(eventContract.getOutcomeCount() > 1);
        int[] memory netOutcomeTokensSoldCopy = netOutcomeTokensSold;

        // Calculate cost level based on net outcome token balances
        int log2N = Math.binaryLog(netOutcomeTokensSoldCopy.length * ONE, Math.EstimationMode.UpperBound);
        int costLevelBefore = calcCostLevel(log2N, netOutcomeTokensSoldCopy, funding, Math.EstimationMode.LowerBound);

        // Change amounts based on outcomeTokenAmounts passed in
        require(netOutcomeTokensSoldCopy.length == outcomeTokenAmounts.length);
        for (uint8 i = 0; i < netOutcomeTokensSoldCopy.length; i++) {
            netOutcomeTokensSoldCopy[i] = netOutcomeTokensSoldCopy[i].add(outcomeTokenAmounts[i]);
        }

        // Calculate cost level after balance was updated
        int costLevelAfter = calcCostLevel(log2N, netOutcomeTokensSoldCopy, funding, Math.EstimationMode.UpperBound);

        // Calculate net cost as cost level difference and use the ceil
        netCost = costLevelAfter.sub(costLevelBefore);
        // Integer division for negative numbers already uses ceiling,
        // so only check boundary condition for positive numbers
        if(netCost <= 0 || netCost / int(ONE) * int(ONE) == netCost) {
            netCost /= int(ONE);
        } else {
            netCost = netCost / int(ONE) + 1;
        }
    }

    /// @dev Returns marginal price of an outcome
    /// @param outcomeTokenIndex Index of outcome to determine marginal price of
    /// @return Marginal price of an outcome as a fixed point number
    function calcMarginalPrice(uint8 outcomeTokenIndex)
        public
        view
        returns (uint price)
    {
        require(eventContract.getOutcomeCount() > 1);
        int[] memory netOutcomeTokensSoldCopy = netOutcomeTokensSold;
        int logN = Math.binaryLog(netOutcomeTokensSoldCopy.length * ONE, Math.EstimationMode.Midpoint);
        // The price function is exp(quantities[i]/b) / sum(exp(q/b) for q in quantities)
        // To avoid overflow, calculate with
        // exp(quantities[i]/b - offset) / sum(exp(q/b - offset) for q in quantities)
        (uint sum, , uint outcomeExpTerm) = sumExpOffset(logN, netOutcomeTokensSoldCopy, funding, outcomeTokenIndex, Math.EstimationMode.Midpoint);
        return outcomeExpTerm / (sum / ONE);
    }

    /*
     *  Private functions
     */
    /// @dev Calculates the result of the LMSR cost function which is used to
    ///      derive prices from the market state
    /// @param logN Logarithm of the number of outcomes
    /// @param netOutcomeTokensSoldCopy Net outcome tokens sold by market
    /// @param _funding Initial funding for market
    /// @return Cost level
    function calcCostLevel(int logN, int[] netOutcomeTokensSoldCopy, uint _funding, Math.EstimationMode estimationMode)
        private
        pure
        returns(int costLevel)
    {
        // The cost function is C = b * log(sum(exp(q/b) for q in quantities)).
        // To avoid overflow, we need to calc with an exponent offset:
        // C = b * (offset + log(sum(exp(q/b - offset) for q in quantities)))
        (uint sum, int offset, ) = sumExpOffset(logN, netOutcomeTokensSoldCopy, _funding, 0, estimationMode);
        costLevel = Math.binaryLog(sum, estimationMode);
        costLevel = costLevel.add(offset);
        costLevel = (costLevel.mul(int(ONE)) / logN).mul(int(_funding));
    }

    /// @dev Calculates sum(exp(q/b - offset) for q in quantities), where offset is set
    ///      so that the sum fits in 248-256 bits
    /// @param logN Logarithm of the number of outcomes
    /// @param netOutcomeTokensSoldCopy Net outcome tokens sold by market
    /// @param _funding Initial funding for market
    /// @param outcomeIndex Index of exponential term to extract (for use by marginal price function)
    /// @return A result structure composed of the sum, the offset used, and the summand associated with the supplied index
    function sumExpOffset(int logN, int[] netOutcomeTokensSoldCopy, uint _funding, uint8 outcomeIndex, Math.EstimationMode estimationMode)
        private
        pure
        returns (uint sum, int offset, uint outcomeExpTerm)
    {
        // Naive calculation of this causes an overflow
        // since anything above a bit over 133*ONE supplied to exp will explode
        // as exp(133) just about fits into 192 bits of whole number data.

        // The choice of this offset is subject to another limit:
        // computing the inner sum successfully.
        // Since the index is 8 bits, there has to be 8 bits of headroom for
        // each summand, meaning q/b - offset <= exponential_limit,
        // where that limit can be found with `mp.floor(mp.log((2**248 - 1) / ONE) * ONE)`
        // That is what EXP_LIMIT is set to: it is about 127.5

        // finally, if the distribution looks like [BIG, tiny, tiny...], using a
        // BIG offset will cause the tiny quantities to go really negative
        // causing the associated exponentials to vanish.

        require(logN >= 0 && int(_funding) >= 0);
        offset = Math.max(netOutcomeTokensSoldCopy);
        offset = offset.mul(logN) / int(_funding);
        offset = offset.sub(EXP_LIMIT);
        uint term;
        for (uint8 i = 0; i < netOutcomeTokensSoldCopy.length; i++) {
            term = Math.pow2((netOutcomeTokensSoldCopy[i].mul(logN) / int(_funding)).sub(offset), estimationMode);
            if (i == outcomeIndex)
                outcomeExpTerm = term;
            sum = sum.add(term);
        }
    }

    /// @dev Allows to fund the market with collateral tokens converting them into outcome tokens
    /// @param _funding Funding amount
    function fund(uint _funding)
        public
        isCreator
        atStage(Stages.MarketCreated)
    {
        // Request collateral tokens and allow event contract to transfer them to buy all outcomes
        require(   eventContract.collateralToken().transferFrom(msg.sender, this, _funding)
                && eventContract.collateralToken().approve(eventContract, _funding));
        eventContract.buyAllOutcomes(_funding);
        funding = _funding;
        stage = Stages.MarketFunded;
        emit AutomatedMarketMakerFunding(funding);
    }

    /// @dev Allows market creator to close the markets by transferring all remaining outcome tokens to the creator
    function close()
        public
        isCreator
        atStage(Stages.MarketFunded)
    {
        uint8 outcomeCount = eventContract.getOutcomeCount();
        for (uint8 i = 0; i < outcomeCount; i++)
            require(eventContract.outcomeTokens(i).transfer(creator, eventContract.outcomeTokens(i).balanceOf(this)));
        stage = Stages.MarketClosed;
        emit AutomatedMarketMakerClosing();
    }

    /// @dev Allows market creator to withdraw fees generated by trades
    /// @return Fee amount
    function withdrawFees()
        public
        isCreator
        returns (uint fees)
    {
        fees = eventContract.collateralToken().balanceOf(this);
        // Transfer fees
        require(eventContract.collateralToken().transfer(creator, fees));
        emit FeeWithdrawal(fees);
    }

    /// @dev Allows to trade outcome tokens and collateral with the market maker
    /// @param outcomeTokenAmounts Amounts of each outcome token to buy or sell. If positive, will buy this amount of outcome token from the market. If negative, will sell this amount back to the market instead.
    /// @param collateralLimit If positive, this is the limit for the amount of collateral tokens which will be sent to the market to conduct the trade. If negative, this is the minimum amount of collateral tokens which will be received from the market for the trade. If zero, there is no limit.
    /// @return If positive, the amount of collateral sent to the market. If negative, the amount of collateral received from the market. If zero, no collateral was sent or received.
    function trade(int[] outcomeTokenAmounts, int collateralLimit)
        public
        atStage(Stages.MarketFunded)
        returns (int netCost)
    {
        uint8 outcomeCount = eventContract.getOutcomeCount();
        require(outcomeTokenAmounts.length == outcomeCount);

        // Calculate net cost for executing trade
        int outcomeTokenNetCost = calcNetCost(outcomeTokenAmounts);
        int fees;
        if(outcomeTokenNetCost < 0)
            fees = int(calcMarketFee(uint(-outcomeTokenNetCost)));
        else
            fees = int(calcMarketFee(uint(outcomeTokenNetCost)));

        require(fees >= 0);
        netCost = outcomeTokenNetCost.add(fees);

        require(
            (collateralLimit != 0 && netCost <= collateralLimit) ||
            collateralLimit == 0
        );

        if(outcomeTokenNetCost > 0) {
            require(
                eventContract.collateralToken().transferFrom(msg.sender, this, uint(netCost)) &&
                eventContract.collateralToken().approve(eventContract, uint(outcomeTokenNetCost))
            );

            eventContract.buyAllOutcomes(uint(outcomeTokenNetCost));
        }

        for (uint8 i = 0; i < outcomeCount; i++) {
            if(outcomeTokenAmounts[i] != 0) {
                if(outcomeTokenAmounts[i] < 0) {
                    require(eventContract.outcomeTokens(i).transferFrom(msg.sender, this, uint(-outcomeTokenAmounts[i])));
                } else {
                    require(eventContract.outcomeTokens(i).transfer(msg.sender, uint(outcomeTokenAmounts[i])));
                }

                netOutcomeTokensSold[i] = netOutcomeTokensSold[i].add(outcomeTokenAmounts[i]);
            }
        }

        if(outcomeTokenNetCost < 0) {
            // This is safe since
            // 0x8000000000000000000000000000000000000000000000000000000000000000 ==
            // uint(-int(-0x8000000000000000000000000000000000000000000000000000000000000000))
            eventContract.sellAllOutcomes(uint(-outcomeTokenNetCost));
            if(netCost < 0) {
                require(eventContract.collateralToken().transfer(msg.sender, uint(-netCost)));
            }
        }

        emit OutcomeTokenTrade(msg.sender, outcomeTokenAmounts, outcomeTokenNetCost, uint(fees));
    }

    /// @dev Calculates fee to be paid to market maker
    /// @param outcomeTokenCost Cost for buying outcome tokens
    /// @return Fee for trade
    function calcMarketFee(uint outcomeTokenCost)
        public
        view
        returns (uint)
    {
        return outcomeTokenCost * fee / FEE_RANGE;
    }
}
