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
        uint[] memory netQuantitiesSold = getNetQuantitiesSold(market);

        uint logN = uint(Math.ln(netQuantitiesSold.length * ONE)) / 10000;
        uint funding = market.funding();
        uint costLevelBefore = calcCostFunction(logN, netQuantitiesSold, funding);
        netQuantitiesSold[outcomeTokenIndex] += outcomeTokenCount;
        uint costLevelAfter = calcCostFunction(logN, netQuantitiesSold, funding);
        // Calculate cost
        cost = (costLevelAfter - costLevelBefore) * (100000 + 2) / 100000 / ONE;
        if (cost > outcomeTokenCount)
            // Make sure cost are not bigger than 1 per share
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
        uint[] memory netQuantitiesSold = getNetQuantitiesSold(market);

        uint logN = uint(Math.ln(netQuantitiesSold.length * ONE)) / 10000;
        uint funding = market.funding();
        uint costLevelBefore = calcCostFunction(logN, netQuantitiesSold, funding);
        netQuantitiesSold[outcomeTokenIndex] -= outcomeTokenCount;
        uint costLevelAfter = calcCostFunction(logN, netQuantitiesSold, funding);
        // Calculate earnings
        profits = (costLevelBefore - costLevelAfter) * (100000 - 2) / 100000 / ONE;
    }

    /*
     *  Private functions
     */
    /// @dev Returns current price for given outcome token
    /// @param logN Logarithm of the number of outcomes
    /// @param netQuantitiesSold Net outcome tokens sold by market
    /// @param funding Initial funding for market
    /// @return Returns costLevel
    function calcCostFunction(uint logN, uint[] netQuantitiesSold, uint funding)
        private
        constant
        returns(uint costLevel)
    {
        uint innerSum = 0;
        uint fundingDivisor = funding / 10000;
        for (uint8 i=0; i<netQuantitiesSold.length; i++)
            innerSum += Math.exp(netQuantitiesSold[i] / fundingDivisor * logN);
        require(innerSum >= ONE);
        costLevel = uint(Math.ln(innerSum)) * ONE / logN * fundingDivisor;
    }

    /// @dev Gets net outcome tokens sold by market. Since all sets of outcome tokens are backed by
    ///      corresponding collateral tokens, the net quantity of a token sold by the market is the
    ///      number of collateral tokens (which is the same as the number of outcome tokens the
    ///      market created) subtracted by the quantity of that token held by the market.
    /// @param market Market contract
    /// @return Net outcome tokens sold by market
    function getNetQuantitiesSold(Market market)
        private
        constant
        returns (uint[] quantities)
    {

        quantities = new uint[](market.eventContract().getOutcomeCount());

        // This loop just gets the holdings of the market
        // Also get the max quantity held to avoid checking every quantity against totalCreated
        uint maxQuantityHeld = 0;
        for(uint i = 0; i < quantities.length; i++) {
            quantities[i] = market.eventContract().outcomeTokens(i).balanceOf(market);
            if(quantities[i] > maxQuantityHeld) maxQuantityHeld = quantities[i];
        }

        uint totalCreated = market.eventContract().collateralToken().balanceOf(market.eventContract());
        require(totalCreated >= maxQuantityHeld);

        // The net outcome tokens minus the holdings of the market gives you the net sold
        for(i = 0; i < quantities.length; i++) {
            quantities[i] = totalCreated - quantities[i];
        }

        return quantities;
    }
}
