pragma solidity 0.4.15;
import "../Markets/StandardMarket.sol";


contract StandardMarketWithPriceLogger is StandardMarket {

    /*
     *  Constants
     */
    uint8 public constant LONG = 1;

    /*
     *  Storage
     */
    uint public startDate;
    uint public endDate;
    uint public lastTrade;
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
        if (_startDate == 0)
            startDate = now;
        else {
            // The earliest start date is the market creation date
            require(_startDate >= now);
            startDate = _startDate;
        }
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
        logPrice();
        cost = super.buy(outcomeTokenIndex, outcomeTokenCount, maxCost);
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
        logPrice();
        profit = super.sell(outcomeTokenIndex, outcomeTokenCount, minProfit);
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
        logPrice();
        cost = super.shortSell(outcomeTokenIndex, outcomeTokenCount, minProfit);
    }

    /// @dev Calculates average price for long tokens based on price integral
    /// @return Average price for long tokens
    function getAvgPrice()
        public
        returns (uint)
    {
        return priceIntegral / (now - startDate);
    }

    /*
     *  Private functions
     */
    /// @dev Adds price integral since the last trade to the total price integral and updates last
    ///      trade timestamp
    function logPrice()
        private
    {
        if (now >= startDate) {
            // Calculate price of long tokens
            uint price = marketMaker.calcMarginalPrice(this, LONG);
            if (lastTrade > 0)
                priceIntegral += price * (now - lastTrade);
            else
                priceIntegral += price * (now - startDate);
            lastTrade = now;
        }
    }
}
