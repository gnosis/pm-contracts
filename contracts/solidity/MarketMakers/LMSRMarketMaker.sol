pragma solidity 0.4.11;
import "Utils/Math.sol";
import "MarketMakers/AbstractMarketMaker.sol";


/// @title LMSR market maker contract - Calculates share prices based on share distribution and initial funding
/// @author Stefan George - <stefan@gnosis.pm>
/// @author Martin Koeppelmann - <martin.koeppelmann@consensys.net>
/// @author Michael Lu - <michael.lu@consensys.net>
contract LMSRMarketMaker is MarketMaker {

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
    function calcCosts(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount)
        public
        constant
        returns (uint cost)
    {
        require(market.eventContract().getOutcomeCount() > 0);
        int[] memory netOutcomeTokensSold = getNetOutcomeTokensSold(market);

        uint logN = uint(Math.ln(netOutcomeTokensSold.length * ONE));
        uint funding = market.funding();
        int costLevelBefore = calcCostFunction(logN, netOutcomeTokensSold, funding);

        require(
            // Math.safeToAdd(netOutcomeTokensSold[outcomeTokenIndex], outcomeTokenCount) &&
            int(outcomeTokenCount) >= 0
        );
        netOutcomeTokensSold[outcomeTokenIndex] += int(outcomeTokenCount);
        
        int costLevelAfter = calcCostFunction(logN, netOutcomeTokensSold, funding);

        // Calculate cost
        require(costLevelAfter >= costLevelBefore);
        cost = uint(costLevelAfter - costLevelBefore);

        // Take the ceiling to account for rounding
        if(cost / ONE * ONE == cost)
            cost /= ONE;
        else
            cost = cost / ONE + 1;

        if (cost > outcomeTokenCount)
            // Make sure cost is not bigger than 1 per share
            cost = outcomeTokenCount;
    }

    /// @dev Returns profits for selling given number of outcome tokens
    /// @param market Market contract
    /// @param outcomeTokenIndex Index of outcome to sell
    /// @param outcomeTokenCount Number of outcome tokens to sell
    /// @return Returns profits
    function calcProfits(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount)
        public
        constant
        returns (uint profits)
    {
        require(market.eventContract().getOutcomeCount() > 0);
        int[] memory netOutcomeTokensSold = getNetOutcomeTokensSold(market);

        uint logN = uint(Math.ln(netOutcomeTokensSold.length * ONE));
        uint funding = market.funding();

        int costLevelBefore = calcCostFunction(logN, netOutcomeTokensSold, funding);

        require(
            // Math.safeToSubtract(netOutcomeTokensSold[outcomeTokenIndex], outcomeTokenCount) &&
            int(outcomeTokenCount) >= 0
        );
        netOutcomeTokensSold[outcomeTokenIndex] -= int(outcomeTokenCount);

        int costLevelAfter = calcCostFunction(logN, netOutcomeTokensSold, funding);

        // Calculate earnings
        require(costLevelBefore >= costLevelAfter);
        // Take the floor
        profits = uint(costLevelBefore - costLevelAfter) / ONE;
    }

    /*
     *  Private functions
     */
    /// @dev Returns current price for given outcome token
    /// @param logN Logarithm of the number of outcomes
    /// @param netOutcomeTokensSold Net outcome tokens sold by market
    /// @param funding Initial funding for market
    /// @return Returns costLevel
    function calcCostFunction(uint logN, int[] netOutcomeTokensSold, uint funding)
        private
        constant
        returns(int costLevel)
    {
        // uint innerSum = 0;
        // for (uint8 i=0; i<netOutcomeTokensSold.length; i++) {
        //     innerSum += Math.exp(netOutcomeTokensSold[i] * int(logN) / int(funding));
        // }
        // costLevel = Math.ln(innerSum) * int(ONE) / int(logN) * int(funding);

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

        // TODO: deal with large quantities better
        int maxQuantity = Math.max(netOutcomeTokensSold);
        require(
            // Math.safeToMultiply(maxQuantity, int(logN)) &&
            int(logN) >= 0 && int(funding) >= 0
        );
        int offset = maxQuantity * int(logN) / int(funding);
        // require(Math.safeToSubtract(offset, EXP_LIMIT));
        offset -= EXP_LIMIT;

        uint innerSum = 0;
        int exponent;
        for (uint8 i=0; i<netOutcomeTokensSold.length; i++) {
            // require(Math.safeToMultiply(netOutcomeTokensSold[i], int(logN)));
            exponent = netOutcomeTokensSold[i] * int(logN) / int(funding);
            // require(Math.safeToSubtract(exponent, offset));
            innerSum += Math.exp(exponent - offset);
        }
        int logsum = Math.ln(innerSum);
        // require(Math.safeToAdd(offset, logsum));
        costLevel = offset + logsum;
        // require(Math.safeToMultiply(costLevel, int(funding)));
        costLevel = costLevel * int(ONE) / int(logN) * int(funding);
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
