pragma solidity 0.4.18;
import "../Markets/StandardMarket.sol";

contract StandardMarketWithPriceLoggerProxy is StandardMarketProxy {
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
    function StandardMarketWithPriceLoggerProxy(address proxied, address _creator, Event _eventContract, MarketMaker _marketMaker, uint24 _fee, uint _startDate)
        public
        StandardMarketProxy(proxied, _creator, _eventContract, _marketMaker, _fee)
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
}

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
    function trade(int[] outcomeTokenAmounts, int collateralLimit)
        public
        returns (int netCost)
    {
        logPriceBefore();
        netCost = super.trade(outcomeTokenAmounts, collateralLimit);
        logPriceAfter();
    }


    /// @dev Allows market creator to close the markets by transferring all remaining outcome tokens to the creator
    function close()
        public
    {
        endDate = now;
        super.close();
    }

    /// @dev Calculates average price for long tokens based on price integral
    /// @return Average price for long tokens over time
    function getAvgPrice()
        public
        view
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
