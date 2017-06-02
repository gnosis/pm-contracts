pragma solidity 0.4.11;
import "Utils/Math.sol";
import "MarketMakers/AbstractMarketMaker.sol";


/// @title LMSR market maker contract - Calculates share prices based on share distribution and initial funding
/// @author Alan Lu - <alan.lu@gnosis.pm>
contract LMSRMarketMaker is MarketMaker {
    using Math for *;

    /*
     *  Constants
     */
    uint constant ONE = 0x10000000000000000;
    int constant EXP_LIMIT = 2352680790717288641401;


    /*
     *  Public functions
     */
    /// @dev Returns cost to buy given number of outcome tokens
    /// @param market Market contract
    /// @param outcomeTokenIndex Index of outcome to buy
    /// @param outcomeTokenCount Number of outcome tokens to buy
    /// @return Returns cost
    function calcCost(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount)
        public
        constant
        returns (uint cost)
    {
        require(market.eventContract().getOutcomeCount() > 1);
        int[] memory netOutcomeTokensSold = getNetOutcomeTokensSold(market);

        int logN = Math.ln(netOutcomeTokensSold.length * ONE);
        uint funding = market.funding();
        int costLevelBefore = calcCostLevel(logN, netOutcomeTokensSold, funding);

        require(int(outcomeTokenCount) >= 0);
        netOutcomeTokensSold[outcomeTokenIndex] = netOutcomeTokensSold[outcomeTokenIndex].add(int(outcomeTokenCount));
        
        int costLevelAfter = calcCostLevel(logN, netOutcomeTokensSold, funding);

        // Calculate cost
        require(costLevelAfter >= costLevelBefore);
        cost = uint(costLevelAfter - costLevelBefore);

        // Take the ceiling to account for rounding
        if(cost / ONE * ONE == cost)
            cost /= ONE;
        else
            // integer division by ONE ensures there is room to (+ 1)
            cost = cost / ONE + 1;

        if (cost > outcomeTokenCount)
            // Make sure cost is not bigger than 1 per share
            cost = outcomeTokenCount;
    }

    /// @dev Returns profit for selling given number of outcome tokens
    /// @param market Market contract
    /// @param outcomeTokenIndex Index of outcome to sell
    /// @param outcomeTokenCount Number of outcome tokens to sell
    /// @return Returns profit
    function calcProfit(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount)
        public
        constant
        returns (uint profit)
    {
        require(market.eventContract().getOutcomeCount() > 0);
        int[] memory netOutcomeTokensSold = getNetOutcomeTokensSold(market);

        int logN = Math.ln(netOutcomeTokensSold.length * ONE);
        uint funding = market.funding();

        int costLevelBefore = calcCostLevel(logN, netOutcomeTokensSold, funding);

        require(int(outcomeTokenCount) >= 0);
        netOutcomeTokensSold[outcomeTokenIndex] = netOutcomeTokensSold[outcomeTokenIndex].sub(int(outcomeTokenCount));

        int costLevelAfter = calcCostLevel(logN, netOutcomeTokensSold, funding);

        // Calculate earnings
        require(costLevelBefore >= costLevelAfter);
        // Take the floor
        profit = uint(costLevelBefore - costLevelAfter) / ONE;
    }

    /// @dev Calculates the result of the LMSR cost function which is used to
    ///      derive prices from the market state
    /// @param logN Logarithm of the number of outcomes
    /// @param netOutcomeTokensSold Net outcome tokens sold by market
    /// @param funding Initial funding for market
    /// @return Returns costLevel
    function calcCostLevel(int logN, int[] netOutcomeTokensSold, uint funding)
        private
        constant
        returns(int costLevel)
    {
        // The cost function is C = b * log(sum(exp(q/b) for q in quantities)),
        // but naive calculation of this causes an overflow
        // since anything above a bit over 133*ONE supplied to exp will explode
        // as exp(133) just about fits into 192 bits of whole number data.

        // To avoid this, we need an exponent offset to keep this from happening:
        // C = b * (offset + log(sum(exp(q/b - offset) for q in quantities)))
        // so q/b - offset must be limited to something <= 133 * ONE.

        // The choice of this offset is subject to another limit:
        // computing the inner sum successfully.
        // Since the index is 8 bits, there has to be 8 bits of headroom for
        // each summand, meaning q/b - offset <= exponential_limit,
        // where that limit can be found with `mp.floor(mp.log((2**248 - 1) / ONE) * ONE)`
        // That is what EXP_LIMIT is set to: it is about 127.5

        // finally, if the distribution looks like [BIG, tiny, tiny...], using a
        // BIG offset will cause the tiny quantities to go really negative
        // causing the associated exponentials to vanish.

        int maxQuantity = Math.max(netOutcomeTokensSold);
        require(
            logN >= 0 && int(funding) >= 0
        );
        int offset = maxQuantity.mul(logN) / int(funding);
        offset = offset.sub(EXP_LIMIT);

        uint innerSum = 0;
        int exponent;
        for (uint8 i=0; i<netOutcomeTokensSold.length; i++) {
            exponent = netOutcomeTokensSold[i].mul(int(logN)) / int(funding);
            innerSum = innerSum.add(Math.exp(exponent.sub(offset)));
        }
        int logsum = Math.ln(innerSum);
        costLevel = offset.add(logsum);
        costLevel = (costLevel.mul(int(ONE)) / int(logN)).mul(int(funding));
    }

    /// @dev Gets net outcome tokens sold by market. Since all sets of outcome tokens are backed by
    ///      corresponding collateral tokens, the net quantity of a token sold by the market is the
    ///      number of collateral tokens (which is the same as the number of outcome tokens the
    ///      market created) subtracted by the quantity of that token held by the market.
    /// @param market Market contract
    /// @return Net outcome tokens sold by market
    function getNetOutcomeTokensSold(Market market)
        private
        constant
        returns (int[] quantities)
    {
        quantities = new int[](market.eventContract().getOutcomeCount());
        for(uint8 i = 0; i < quantities.length; i++)
            quantities[i] = market.netOutcomeTokensSold(i);
    }
}
