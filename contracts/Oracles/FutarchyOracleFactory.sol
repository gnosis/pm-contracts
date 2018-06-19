pragma solidity ^0.4.24;
import "../Oracles/FutarchyOracle.sol";


/// @title Futarchy oracle factory contract - Allows to create Futarchy oracle contracts
/// @author Stefan George - <stefan@gnosis.pm>
contract FutarchyOracleFactory {

    /*
     *  Events
     */
    event FutarchyOracleCreation(
        address indexed creator,
        FutarchyOracle futarchyOracle,
        Token collateralToken,
        Oracle oracle,
        uint8 outcomeCount,
        int lowerBound,
        int upperBound,
        MarketMaker marketMaker,
        uint24 fee,
        uint tradingPeriod,
        uint startDate
    );

    /*
     *  Storage
     */
    EventFactory eventFactory;
    StandardMarketWithPriceLoggerFactory marketFactory;
    FutarchyOracle public futarchyOracleMasterCopy;

    /*
     *  Public functions
     */
    /// @dev Constructor sets event factory contract
    /// @param _eventFactory Event factory contract
    /// @param _marketFactory Market factory contract
    constructor(FutarchyOracle _futarchyOracleMasterCopy, EventFactory _eventFactory, StandardMarketWithPriceLoggerFactory _marketFactory)
        public
    {
        require(address(_eventFactory) != 0 && address(_marketFactory) != 0);
        futarchyOracleMasterCopy = _futarchyOracleMasterCopy;
        eventFactory = _eventFactory;
        marketFactory = _marketFactory;
    }

    /// @dev Creates a new Futarchy oracle contract
    /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    /// @param lowerBound Lower bound for event outcome
    /// @param upperBound Lower bound for event outcome
    /// @param marketMaker Market maker contract
    /// @param fee Market fee
    /// @param tradingPeriod Trading period before decision can be determined
    /// @param startDate Start date for price logging
    /// @return Oracle contract
    function createFutarchyOracle(
        Token collateralToken,
        Oracle oracle,
        uint8 outcomeCount,
        int lowerBound,
        int upperBound,
        MarketMaker marketMaker,
        uint24 fee,
        uint tradingPeriod,
        uint startDate
    )
        public
        returns (FutarchyOracle futarchyOracle)
    {
        futarchyOracle = FutarchyOracle(new FutarchyOracleProxy(
            futarchyOracleMasterCopy,
            msg.sender,
            eventFactory,
            collateralToken,
            oracle,
            outcomeCount,
            lowerBound,
            upperBound,
            marketFactory,
            marketMaker,
            fee,
            tradingPeriod,
            startDate
        ));
        emit FutarchyOracleCreation(
            msg.sender,
            futarchyOracle,
            collateralToken,
            oracle,
            outcomeCount,
            lowerBound,
            upperBound,
            marketMaker,
            fee,
            tradingPeriod,
            startDate
        );
    }
}
