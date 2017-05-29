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

        uint logN = uint(Math.ln(netOutcomeTokensSold.length * ONE)) / 10000;
        uint funding = market.funding();
        uint costLevelBefore = calcCostFunction(logN, netOutcomeTokensSold, funding);

        // require(Math.safeToAdd(netOutcomeTokensSold[outcomeTokenIndex], outcomeTokenCount));
        netOutcomeTokensSold[outcomeTokenIndex] += int(outcomeTokenCount);
        
        uint costLevelAfter = calcCostFunction(logN, netOutcomeTokensSold, funding);

        // Calculate cost
        cost = (costLevelAfter - costLevelBefore) * (100000 + 2) / 100000 / ONE;
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

        uint logN = uint(Math.ln(netOutcomeTokensSold.length * ONE)) / 10000;
        uint funding = market.funding();

        uint costLevelBefore = calcCostFunction(logN, netOutcomeTokensSold, funding);

        // require(Math.safeToSubtract(netOutcomeTokensSold[outcomeTokenIndex], outcomeTokenCount));
        netOutcomeTokensSold[outcomeTokenIndex] -= int(outcomeTokenCount);

        uint costLevelAfter = calcCostFunction(logN, netOutcomeTokensSold, funding);

        // Calculate earnings
        profits = (costLevelBefore - costLevelAfter) * (100000 - 2) / 100000 / ONE;
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
        returns(uint costLevel)
    {
        uint innerSum = 0;
        uint fundingDivisor = funding / 10000;
        for (uint8 i=0; i<netOutcomeTokensSold.length; i++) {
            innerSum += Math.exp(netOutcomeTokensSold[i] / int(fundingDivisor) * int(logN));
        }
        require(innerSum >= ONE);
        costLevel = uint(Math.ln(innerSum)) * ONE / logN * fundingDivisor;
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
