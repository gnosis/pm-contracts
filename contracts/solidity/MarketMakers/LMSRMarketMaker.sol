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
    /// @dev Returns costs to buy given number of outcome tokens
    /// @param market Market contract
    /// @param outcomeTokenIndex Index of outcome to buy
    /// @param outcomeTokenCount Number of outcome tokens to buy
    /// @return Returns costs
    function calcCosts(Market market, uint8 outcomeTokenIndex, uint outcomeTokenCount)
        public
        constant
        returns (uint costs)
    {
        uint[] memory outcomeTokenDistribution = getOutcomeTokenDistribution(market);
        uint[2] memory outcomeTokenRange = getOutcomeTokenRange(outcomeTokenDistribution);
        uint invB = Math.ln(outcomeTokenDistribution.length * ONE) / 10000;
        uint funding = market.funding();
        uint costsBefore = calcCurrentCosts(invB, outcomeTokenRange, outcomeTokenDistribution, funding);
        outcomeTokenDistribution[outcomeTokenIndex] -= outcomeTokenCount;
        uint costsAfter = calcCurrentCosts(invB, outcomeTokenRange, outcomeTokenDistribution, funding);
        // Calculate costs
        costs = (costsAfter - costsBefore) * (funding / 10000) * (100000 + 2) / 100000 / ONE;
        if (costs > outcomeTokenCount)
            // Make sure costs are not bigger than 1 per share
            costs = outcomeTokenCount;
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
        uint[] memory outcomeTokenDistribution = getOutcomeTokenDistribution(market);
        uint[2] memory outcomeTokenRange = getOutcomeTokenRange(outcomeTokenDistribution);
        uint invB = Math.ln(outcomeTokenDistribution.length * ONE) / 10000;
        uint funding = market.funding();
        outcomeTokenRange[1] += outcomeTokenCount;
        uint costsBefore = calcCurrentCosts(invB, outcomeTokenRange, outcomeTokenDistribution, funding);
        outcomeTokenDistribution[outcomeTokenIndex] += outcomeTokenCount;
        uint costsAfter = calcCurrentCosts(invB, outcomeTokenRange, outcomeTokenDistribution, funding);
        // Calculate earnings
        profits = (costsBefore - costsAfter) * (funding / 10000) * (100000 - 2) / 100000 / ONE;
    }

    /*
     *  Private functions
     */
    /// @dev Returns current price for given outcome token
    /// @param invB Cost indicator
    /// @param outcomeTokenRange Lowest and highest number of outcome tokens owned by market
    /// @param outcomeTokenDistribution Outcome tokens owned by market
    /// @param funding Initial funding for market
    /// @return Returns costs
    function calcCurrentCosts(uint invB, uint[2] outcomeTokenRange, uint[] outcomeTokenDistribution, uint funding)
        public
        returns(uint costs)
    {
        uint innerSum = 0;
        uint fundingDivisor = funding / 10000;
        for (uint8 i=0; i<outcomeTokenDistribution.length; i++)
            innerSum += Math.exp((outcomeTokenRange[1] - outcomeTokenRange[0] - (outcomeTokenDistribution[i] - outcomeTokenRange[0])) / fundingDivisor * invB);
        costs = Math.ln(innerSum) * ONE / invB;
    }

    /// @dev Returns outcome tokens owned by market
    /// @param market Market contract
    /// @return Returns Outcome tokens owned by market
    function getOutcomeTokenDistribution(Market market)
        public
        returns (uint[] outcomeTokenDistribution)
    {
        outcomeTokenDistribution = new uint[](market.eventContract().getOutcomeCount());
        for (uint i=0; i<outcomeTokenDistribution.length; i++)
            outcomeTokenDistribution[i] = market.eventContract().outcomeTokens(i).balanceOf(market);
    }

    /// @dev Returns lowest and highest number of outcome tokens owned by market
    /// @return Returns lowest and highest number of outcome tokens
    function getOutcomeTokenRange(uint[] outcomeTokenDistribution)
        public
        returns (uint[2] outcomeTokenRange)
    {
        // Lowest shares
        outcomeTokenRange[0] = outcomeTokenDistribution[0];
        // Highest shares
        outcomeTokenRange[1] = outcomeTokenDistribution[0];
        for (uint8 i=0; i<outcomeTokenDistribution.length; i++)
            if (outcomeTokenDistribution[i] < outcomeTokenRange[0])
                outcomeTokenRange[0] = outcomeTokenDistribution[i];
            else if (outcomeTokenDistribution[i] > outcomeTokenRange[1])
                outcomeTokenRange[1] = outcomeTokenDistribution[i];
    }
}
