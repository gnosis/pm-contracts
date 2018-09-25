pragma solidity ^0.4.24;
import "@gnosis.pm/util-contracts/contracts/Fixed192x64Math.sol";
import "./MarketMaker.sol";
import "../Events/EventManager.sol";

/// @title LMSR market maker contract - Calculates share prices based on share distribution and initial funding
/// @author Alan Lu - <alan.lu@gnosis.pm>
contract LMSRMarketMaker is MarketMaker {

    /*
     *  Constants
     */
    uint constant ONE = 0x10000000000000000;
    int constant EXP_LIMIT = 3394200909562557497344;

    constructor(EventManager _eventManager, bytes32 _outcomeTokenSetId, uint64 _fee)
        public MarketMaker(_eventManager, _outcomeTokenSetId, _fee) {}
    
    /// @dev Calculates the net cost for executing a given trade.
    /// @param outcomeTokenAmounts Amounts of outcome tokens to buy from the market. If an amount is negative, represents an amount to sell to the market.
    /// @return Net cost of trade. If positive, represents amount of collateral which would be paid to the market for the trade. If negative, represents amount of collateral which would be received from the market for the trade.
    function calcNetCost(int[] outcomeTokenAmounts)
        public
        view
        returns (int netCost)
    {
        require(eventManager.getOutcomeTokenSetLength(outcomeTokenSetId) > 1);
        int[] memory netOutcomeTokensSoldCopy = netOutcomeTokensSold;

        // Calculate cost level based on net outcome token balances
        int log2N = Fixed192x64Math.binaryLog(netOutcomeTokensSoldCopy.length * ONE, Fixed192x64Math.EstimationMode.UpperBound);
        int costLevelBefore = calcCostLevel(log2N, netOutcomeTokensSoldCopy, Fixed192x64Math.EstimationMode.LowerBound);

        // Change amounts based on outcomeTokenAmounts passed in
        require(netOutcomeTokensSoldCopy.length == outcomeTokenAmounts.length);
        for (uint8 i = 0; i < netOutcomeTokensSoldCopy.length; i++) {
            netOutcomeTokensSoldCopy[i] = netOutcomeTokensSoldCopy[i].add(outcomeTokenAmounts[i]);
        }

        // Calculate cost level after balance was updated
        int costLevelAfter = calcCostLevel(log2N, netOutcomeTokensSoldCopy, Fixed192x64Math.EstimationMode.UpperBound);

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
        require(eventManager.getOutcomeTokenSetLength(outcomeTokenSetId) > 1);
        int[] memory netOutcomeTokensSoldCopy = netOutcomeTokensSold;
        int logN = Fixed192x64Math.binaryLog(netOutcomeTokensSoldCopy.length * ONE, Fixed192x64Math.EstimationMode.Midpoint);
        // The price function is exp(quantities[i]/b) / sum(exp(q/b) for q in quantities)
        // To avoid overflow, calculate with
        // exp(quantities[i]/b - offset) / sum(exp(q/b - offset) for q in quantities)
        (uint sum, , uint outcomeExpTerm) = sumExpOffset(logN, netOutcomeTokensSoldCopy, outcomeTokenIndex, Fixed192x64Math.EstimationMode.Midpoint);
        return outcomeExpTerm / (sum / ONE);
    }

    /*
     *  Private functions
     */
    /// @dev Calculates the result of the LMSR cost function which is used to
    ///      derive prices from the market state
    /// @param logN Logarithm of the number of outcomes
    /// @param netOutcomeTokensSoldCopy Net outcome tokens sold by market
    /// @return Cost level
    function calcCostLevel(int logN, int[] netOutcomeTokensSoldCopy, Fixed192x64Math.EstimationMode estimationMode)
        private
        view
        returns(int costLevel)
    {
        // The cost function is C = b * log(sum(exp(q/b) for q in quantities)).
        // To avoid overflow, we need to calc with an exponent offset:
        // C = b * (offset + log(sum(exp(q/b - offset) for q in quantities)))
        (uint sum, int offset, ) = sumExpOffset(logN, netOutcomeTokensSoldCopy, 0, estimationMode);
        costLevel = Fixed192x64Math.binaryLog(sum, estimationMode);
        costLevel = costLevel.add(offset);
        costLevel = (costLevel.mul(int(ONE)) / logN).mul(int(funding));
    }

    /// @dev Calculates sum(exp(q/b - offset) for q in quantities), where offset is set
    ///      so that the sum fits in 248-256 bits
    /// @param logN Logarithm of the number of outcomes
    /// @param netOutcomeTokensSoldCopy Net outcome tokens sold by market
    /// @param outcomeIndex Index of exponential term to extract (for use by marginal price function)
    /// @return A result structure composed of the sum, the offset used, and the summand associated with the supplied index
    function sumExpOffset(int logN, int[] netOutcomeTokensSoldCopy, uint8 outcomeIndex, Fixed192x64Math.EstimationMode estimationMode)
        private
        view
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

        require(logN >= 0 && int(funding) >= 0);
        offset = Fixed192x64Math.max(netOutcomeTokensSoldCopy);
        offset = offset.mul(logN) / int(funding);
        offset = offset.sub(EXP_LIMIT);
        uint term;
        for (uint8 i = 0; i < netOutcomeTokensSoldCopy.length; i++) {
            term = Fixed192x64Math.pow2((netOutcomeTokensSoldCopy[i].mul(logN) / int(funding)).sub(offset), estimationMode);
            if (i == outcomeIndex)
                outcomeExpTerm = term;
            sum = sum.add(term);
        }
    }
}
