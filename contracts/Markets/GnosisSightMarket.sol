pragma solidity ^0.4.25;
import "../Markets/Market.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../Events/Event.sol";
import "../MarketMakers/MarketMaker.sol";
import "./StandardMarket.sol";

contract GnosisSightMarketProxy is Proxy, MarketData, StandardMarketData, StandardMarketProxy {
    constructor(address proxy, address _creator, Event _eventContract, MarketMaker _marketMaker, uint24 _fee, Whitelist _whitelist)
    StandardMarketProxy(proxy, _creator, _eventContract, _marketMaker, _fee)
        public
    {
        whitelist = _whitelist;
    }
}

/// @title Standard market contract - Backed implementation of standard markets
/// @author Stefan George - <stefan@gnosis.pm>
contract GnosisSightMarket is Proxied, Market, StandardMarketData, StandardMarket {
    modifier isWhitelisted() {
        require(whitelist.isWhitelisted(msg.sender) == true, 'User must be whiteliisted to participate in the market');
        _;
    }

    /// @dev Allows to buy outcome tokens from market maker
    /// @param outcomeTokenIndex Index of the outcome token to buy
    /// @param outcomeTokenCount Amount of outcome tokens to buy
    /// @param maxCost The maximum cost in collateral tokens to pay for outcome tokens
    /// @return Cost in collateral tokens
    function buy(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint maxCost)
        public
        isWhitelisted
        atStage(Stages.MarketFunded)
        returns (uint cost)
    {
        require(int(outcomeTokenCount) >= 0 && int(maxCost) > 0);
        uint8 outcomeCount = eventContract.getOutcomeCount();
        require(outcomeTokenIndex >= 0 && outcomeTokenIndex < outcomeCount);
        int[] memory outcomeTokenAmounts = new int[](outcomeCount);
        outcomeTokenAmounts[outcomeTokenIndex] = int(outcomeTokenCount);
        (int netCost, int outcomeTokenNetCost, uint fees) = tradeImpl(outcomeCount, outcomeTokenAmounts, int(maxCost));
        require(netCost >= 0 && outcomeTokenNetCost >= 0);
        cost = uint(netCost);
        emit OutcomeTokenPurchase(msg.sender, outcomeTokenIndex, outcomeTokenCount, uint(outcomeTokenNetCost), fees);
    }

    /// @dev Allows to sell outcome tokens to market maker
    /// @param outcomeTokenIndex Index of the outcome token to sell
    /// @param outcomeTokenCount Amount of outcome tokens to sell
    /// @param minProfit The minimum profit in collateral tokens to earn for outcome tokens
    /// @return Profit in collateral tokens
    function sell(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint minProfit)
        public
        isWhitelisted
        atStage(Stages.MarketFunded)
        returns (uint profit)
    {
        require(-int(outcomeTokenCount) <= 0 && -int(minProfit) < 0);
        uint8 outcomeCount = eventContract.getOutcomeCount();
        require(outcomeTokenIndex >= 0 && outcomeTokenIndex < outcomeCount);
        int[] memory outcomeTokenAmounts = new int[](outcomeCount);
        outcomeTokenAmounts[outcomeTokenIndex] = -int(outcomeTokenCount);
        (int netCost, int outcomeTokenNetCost, uint fees) = tradeImpl(outcomeCount, outcomeTokenAmounts, -int(minProfit));
        require(netCost <= 0 && outcomeTokenNetCost <= 0);
        profit = uint(-netCost);
        emit OutcomeTokenSale(msg.sender, outcomeTokenIndex, outcomeTokenCount, uint(-outcomeTokenNetCost), fees);
    }

    /// @dev Buys all outcomes, then sells all shares of selected outcome which were bought, keeping
    ///      shares of all other outcome tokens.
    /// @param outcomeTokenIndex Index of the outcome token to short sell
    /// @param outcomeTokenCount Amount of outcome tokens to short sell
    /// @param minProfit The minimum profit in collateral tokens to earn for short sold outcome tokens
    /// @return Cost to short sell outcome in collateral tokens
    function shortSell(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint minProfit)
        public
        isWhitelisted
        returns (uint cost)
    {
        // Buy all outcomes
        require(   eventContract.collateralToken().transferFrom(msg.sender, this, outcomeTokenCount)
                && eventContract.collateralToken().approve(eventContract, outcomeTokenCount));
        eventContract.buyAllOutcomes(outcomeTokenCount);
        // Short sell selected outcome
        eventContract.outcomeTokens(outcomeTokenIndex).approve(this, outcomeTokenCount);
        uint profit = this.sell(outcomeTokenIndex, outcomeTokenCount, minProfit);
        cost = outcomeTokenCount - profit;
        // Transfer outcome tokens to buyer
        uint8 outcomeCount = eventContract.getOutcomeCount();
        for (uint8 i = 0; i < outcomeCount; i++)
            if (i != outcomeTokenIndex)
                require(eventContract.outcomeTokens(i).transfer(msg.sender, outcomeTokenCount));
        // Send change back to buyer
        require(eventContract.collateralToken().transfer(msg.sender, profit));
        emit OutcomeTokenShortSale(msg.sender, outcomeTokenIndex, outcomeTokenCount, cost);
    }

    /// @dev Allows to trade outcome tokens and collateral with the market maker
    /// @param outcomeTokenAmounts Amounts of each outcome token to buy or sell. If positive, will buy this amount of outcome token from the market. If negative, will sell this amount back to the market instead.
    /// @param collateralLimit If positive, this is the limit for the amount of collateral tokens which will be sent to the market to conduct the trade. If negative, this is the minimum amount of collateral tokens which will be received from the market for the trade. If zero, there is no limit.
    /// @return If positive, the amount of collateral sent to the market. If negative, the amount of collateral received from the market. If zero, no collateral was sent or received.
    function trade(int[] outcomeTokenAmounts, int collateralLimit)
        public
        isWhitelisted
        atStage(Stages.MarketFunded)
        returns (int netCost)
    {
        uint8 outcomeCount = eventContract.getOutcomeCount();
        require(outcomeTokenAmounts.length == outcomeCount);

        int outcomeTokenNetCost;
        uint fees;
        (netCost, outcomeTokenNetCost, fees) = tradeImpl(outcomeCount, outcomeTokenAmounts, collateralLimit);

        emit OutcomeTokenTrade(msg.sender, outcomeTokenAmounts, outcomeTokenNetCost, fees);
    }
}
