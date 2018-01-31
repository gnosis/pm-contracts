pragma solidity 0.4.15;
import "../Events/CategoricalEvent.sol";
import "../Events/ScalarEvent.sol";


/// @title Event factory contract - Allows creation of categorical and scalar events
/// @author Stefan George - <stefan@gnosis.pm>
contract EventFactory {

    /*
     *  Events
     */
    event CategoricalEventCreation(address indexed creator, CategoricalEvent categoricalEvent, Token collateralToken, Oracle oracle, uint8 outcomeCount);
    event ScalarEventCreation(address indexed creator, ScalarEvent scalarEvent, Token collateralToken, Oracle oracle, int lowerBound, int upperBound);

    /*
     *  Storage
     */
    mapping (bytes32 => CategoricalEvent) public categoricalEvents;
    mapping (bytes32 => ScalarEvent) public scalarEvents;
    CategoricalEvent public categoricalEventMasterCopy;
    ScalarEvent public scalarEventMasterCopy;
    OutcomeToken public outcomeTokenMasterCopy;

    /*
     *  Public functions
     */
    function EventFactory(
        CategoricalEvent _categoricalEventMasterCopy,
        ScalarEvent _scalarEventMasterCopy,
        OutcomeToken _outcomeTokenMasterCopy
    )
        public
    {
        categoricalEventMasterCopy = _categoricalEventMasterCopy;
        scalarEventMasterCopy = _scalarEventMasterCopy;
        outcomeTokenMasterCopy = _outcomeTokenMasterCopy;
    }

    /// @dev Creates a new categorical event and adds it to the event mapping
    /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    /// @return Event contract
    function createCategoricalEvent(
        Token collateralToken,
        Oracle oracle,
        uint8 outcomeCount
    )
        public
        returns (CategoricalEvent eventContract)
    {
        bytes32 eventHash = keccak256(collateralToken, oracle, outcomeCount);
        // Event should not exist yet
        require(address(categoricalEvents[eventHash]) == 0);
        // Create event
        eventContract = CategoricalEvent(new CategoricalEventProxy(
            categoricalEventMasterCopy,
            outcomeTokenMasterCopy,
            collateralToken,
            oracle,
            outcomeCount
        ));
        categoricalEvents[eventHash] = eventContract;
        CategoricalEventCreation(msg.sender, eventContract, collateralToken, oracle, outcomeCount);
    }

    /// @dev Creates a new scalar event and adds it to the event mapping
    /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param oracle Oracle contract used to resolve the event
    /// @param lowerBound Lower bound for event outcome
    /// @param upperBound Lower bound for event outcome
    /// @return Event contract
    function createScalarEvent(
        Token collateralToken,
        Oracle oracle,
        int lowerBound,
        int upperBound
    )
        public
        returns (ScalarEvent eventContract)
    {
        bytes32 eventHash = keccak256(collateralToken, oracle, lowerBound, upperBound);
        // Event should not exist yet
        require(address(scalarEvents[eventHash]) == 0);
        // Create event
        eventContract = ScalarEvent(new ScalarEventProxy(
            scalarEventMasterCopy,
            outcomeTokenMasterCopy,
            collateralToken,
            oracle,
            lowerBound,
            upperBound
        ));
        scalarEvents[eventHash] = eventContract;
        ScalarEventCreation(msg.sender, eventContract, collateralToken, oracle, lowerBound, upperBound);
    }
}
