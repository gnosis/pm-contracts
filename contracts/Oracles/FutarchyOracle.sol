pragma solidity ^0.4.24;
import "../Oracles/Oracle.sol";
import "../Events/EventFactory.sol";
import "../Markets/StandardMarketWithPriceLoggerFactory.sol";
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";


contract FutarchyOracleData {

    /*
     *  Events
     */
    event FutarchyFunding(uint funding);
    event FutarchyClosing();
    event OutcomeAssignment(uint winningMarketIndex);

    /*
     *  Constants
     */
    uint8 public constant LONG = 1;

    /*
     *  Storage
     */
    address creator;
    StandardMarketWithPriceLogger[] public markets;
    CategoricalEvent public categoricalEvent;
    uint public tradingPeriod;
    uint public winningMarketIndex;
    bool public isSet;

    /*
     *  Modifiers
     */
    modifier isCreator() {
        // Only creator is allowed to proceed
        require(msg.sender == creator);
        _;
    }
}

contract FutarchyOracleProxy is Proxy, FutarchyOracleData {

    /// @dev Constructor creates events and markets for futarchy oracle
    /// @param _creator Oracle creator
    /// @param eventFactory Event factory contract
    /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    /// @param lowerBound Lower bound for event outcome
    /// @param upperBound Lower bound for event outcome
    /// @param marketFactory Market factory contract
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @param _tradingPeriod Trading period before decision can be determined
    /// @param startDate Start date for price logging
    constructor(
        address proxied,
        address _creator,
        EventFactory eventFactory,
        ERC20 collateralToken,
        Oracle oracle,
        uint8 outcomeCount,
        int lowerBound,
        int upperBound,
        StandardMarketWithPriceLoggerFactory marketFactory,
        MarketMaker marketMaker,
        uint24 fee,
        uint _tradingPeriod,
        uint startDate
    )
        Proxy(proxied)
        public
    {
        // trading period is at least a second
        require(_tradingPeriod > 0);
        // Create decision event
        categoricalEvent = eventFactory.createCategoricalEvent(collateralToken, Oracle(this), outcomeCount);
        // Create outcome events
        for (uint8 i = 0; i < categoricalEvent.getOutcomeCount(); i++) {
            ScalarEvent scalarEvent = eventFactory.createScalarEvent(
                categoricalEvent.outcomeTokens(i),
                oracle,
                lowerBound,
                upperBound
            );
            markets.push(marketFactory.createMarket(scalarEvent, marketMaker, fee, startDate));
        }
        creator = _creator;
        tradingPeriod = _tradingPeriod;
    }
}

/// @title Futarchy oracle contract - Allows to create an oracle based on market behaviour
/// @author Stefan George - <stefan@gnosis.pm>
contract FutarchyOracle is Proxied, Oracle, FutarchyOracleData {
    using SafeMath for *;

    /*
     *  Public functions
     */
    /// @dev Funds all markets with equal amount of funding
    /// @param funding Amount of funding
    function fund(uint funding)
        public
        isCreator
    {
        // Buy all outcomes
        require(   categoricalEvent.collateralToken().transferFrom(creator, this, funding)
                && categoricalEvent.collateralToken().approve(categoricalEvent, funding));
        categoricalEvent.buyAllOutcomes(funding);
        // Fund each market with outcome tokens from categorical event
        for (uint8 i = 0; i < markets.length; i++) {
            Market market = markets[i];
            // Approve funding for market
            require(market.eventContract().collateralToken().approve(market, funding));
            market.fund(funding);
        }
        emit FutarchyFunding(funding);
    }

    /// @dev Closes market for winning outcome and redeems winnings and sends all collateral tokens to creator
    function close()
        public
        isCreator
    {
        // Winning outcome has to be set
        Market market = markets[uint(getOutcome())];
        require(categoricalEvent.isOutcomeSet() && market.eventContract().isOutcomeSet());
        // Close market and transfer all outcome tokens from winning outcome to this contract
        market.close();
        market.eventContract().redeemWinnings();
        market.withdrawFees();
        // Redeem collateral token for winning outcome tokens and transfer collateral tokens to creator
        categoricalEvent.redeemWinnings();
        require(categoricalEvent.collateralToken().transfer(creator, categoricalEvent.collateralToken().balanceOf(this)));
        emit FutarchyClosing();
    }

    /// @dev Allows to set the oracle outcome based on the market with largest long position
    function setOutcome()
        public
    {
        // Outcome is not set yet and trading period is over
        require(!isSet && markets[0].startDate() + tradingPeriod < now);
        // Find market with highest marginal price for long outcome tokens
        uint highestAvgPrice = markets[0].getAvgPrice();
        uint highestIndex = 0;
        for (uint8 i = 1; i < markets.length; i++) {
            uint avgPrice = markets[i].getAvgPrice();
            if (avgPrice > highestAvgPrice) {
                highestAvgPrice = avgPrice;
                highestIndex = i;
            }
        }
        winningMarketIndex = highestIndex;
        isSet = true;
        emit OutcomeAssignment(winningMarketIndex);
    }

    /// @dev Returns if winning outcome is set
    /// @return Is outcome set?
    function isOutcomeSet()
        public
        view
        returns (bool)
    {
        return isSet;
    }

    /// @dev Returns winning outcome
    /// @return Outcome
    function getOutcome()
        public
        view
        returns (int)
    {
        return int(winningMarketIndex);
    }
}
