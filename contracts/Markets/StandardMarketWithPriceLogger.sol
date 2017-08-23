pragma solidity 0.4.15;
import "../Markets/StandardMarket.sol";


contract StandardMarketWithPriceLogger is StandardMarket {

    /*
     *  Constants
     */
    uint constant ONE = 0x10000000000000000;
    uint8 public constant LONG = 1;

    /*
     *  Storage
     */
    uint public startDate;
    uint public endDate;
    uint public lastTradeDate;
    uint public lastTradePrice;
    uint public priceIntegral;

    /*
     *  Public functions
     */
    /// @dev Constructor validates and sets market properties
    /// @param _creator Market creator
    /// @param _eventContract Event contract
    /// @param _marketMaker Market maker contract
    /// @param _fee Market fee
    /// @param _startDate Start date for price logging
    function StandardMarketWithPriceLogger(address _creator, Event _eventContract, MarketMaker _marketMaker, uint24 _fee, uint _startDate)
        public
        StandardMarket(_creator, _eventContract, _marketMaker, _fee)
    {
        require(eventContract.getOutcomeCount() == 2);

        if (_startDate == 0)
            startDate = now;
        else {
            // The earliest start date is the market creation date
            require(_startDate >= now);
            startDate = _startDate;
        }

        lastTradeDate = startDate;
        // initialize lastTradePrice to assuming uniform probabilities of outcomes
        lastTradePrice = ONE / 2;
    }

    /// @dev Allows market creator to close the markets by transferring all remaining outcome tokens to the creator
    function close()
        public
    {
        endDate = now;
        super.close();
    }

    /// @dev Allows to buy outcome tokens from market maker
    /// @param outcomeTokenIndex Index of the outcome token to buy
    /// @param outcomeTokenCount Amount of outcome tokens to buy
    /// @param maxCost The maximum cost in collateral tokens to pay for outcome tokens
    /// @return Cost in collateral tokens
    function buy(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint maxCost)
        public
        returns (uint cost)
    {
        logPriceBefore();
        cost = super.buy(outcomeTokenIndex, outcomeTokenCount, maxCost);
        logPriceAfter();
    }

    /// @dev Allows to sell outcome tokens to market maker
    /// @param outcomeTokenIndex Index of the outcome token to sell
    /// @param outcomeTokenCount Amount of outcome tokens to sell
    /// @param minProfit The minimum profit in collateral tokens to earn for outcome tokens
    /// @return Profit in collateral tokens
    function sell(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint minProfit)
        public
        returns (uint profit)
    {
        logPriceBefore();
        profit = super.sell(outcomeTokenIndex, outcomeTokenCount, minProfit);
        logPriceAfter();
    }

    /// @dev Buys all outcomes, then sells all shares of selected outcome which were bought, keeping
    ///      shares of all other outcome tokens.
    /// @param outcomeTokenIndex Index of the outcome token to short sell
    /// @param outcomeTokenCount Amount of outcome tokens to short sell
    /// @param minProfit The minimum profit in collateral tokens to earn for short sold outcome tokens
    /// @return Cost to short sell outcome in collateral tokens
    function shortSell(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint minProfit)
        public
        returns (uint cost)
    {
        logPriceBefore();
        cost = super.shortSell(outcomeTokenIndex, outcomeTokenCount, minProfit);
        logPriceAfter();
    }

    /// @dev Calculates average price for long tokens based on price integral
    /// @return Average price for long tokens over time
    function getAvgPrice()
        public
        returns (uint)
    {
        if(endDate > 0)
            return (priceIntegral + lastTradePrice * (endDate - lastTradeDate)) / (endDate - startDate);
        return (priceIntegral + lastTradePrice * (now - lastTradeDate)) / (now - startDate);
    }

    /*
     *  Private functions
     */
    /// @dev Adds price integral since the last trade to the total price integral
    function logPriceBefore()
        private
    {
        if (now >= startDate) {
            // Accumulate price integral only if logging has begun
            priceIntegral += lastTradePrice * (now - lastTradeDate);
        }
    }

    /// @dev Updates last trade timestamp and price
    function logPriceAfter()
        private
    {
        // Refresh lastTradePrice after every transactions as we don't know if
        // this will be the last transaction before logging period starts
        lastTradePrice = marketMaker.calcMarginalPrice(this, LONG);
        lastTradeDate = now;
    }
}
