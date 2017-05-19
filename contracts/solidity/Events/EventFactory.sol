pragma solidity 0.4.11;
import "Events/CategoricalEvent.sol";
import "Events/ScalarEvent.sol";


/// @title Event factory contract - Allows create categorical and scalar events
/// @author Stefan George - <stefan@gnosis.pm>
contract EventFactory {

    /*
     *  Events
     */
    event CategoricalEventCreation(address indexed creator, CategoricalEvent categoricalEvent, Token collateralToken, Oracle oracle, uint outcomeCount);
    event ScalarEventCreation(address indexed creator, ScalarEvent scalarEvent, Token collateralToken, Oracle oracle, int lowerBound, int upperBound);

    /*
     *  Storage
     */
    mapping (bytes32 => CategoricalEvent) public categoricalEvents;
    mapping (bytes32 => ScalarEvent) public scalarEvents;

    /*
     *  Public functions
     */
    /// @dev Creates a new categorical event and adds it to the event mapping
    /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param oracle Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    /// @return Returns event contract
    function createCategoricalEvent(
        Token collateralToken,
        Oracle oracle,
        uint outcomeCount
    )
        public
        returns (CategoricalEvent eventContract)
    {
        bytes32 eventHash = keccak256(collateralToken, oracle, outcomeCount);
        if (address(categoricalEvents[eventHash]) != 0)
            // Event does exist
            revert();
        eventContract = new CategoricalEvent(
            collateralToken,
            oracle,
            outcomeCount
        );
        categoricalEvents[eventHash] = eventContract;
        CategoricalEventCreation(msg.sender, eventContract, collateralToken, oracle, outcomeCount);
    }

    /// @dev Creates a new scalar event and adds it to the event mapping
    /// @param collateralToken Tokens used as collateral in exchange for outcome tokens
    /// @param oracle Oracle contract used to resolve the event
    /// @param lowerBound Lower bound for event outcome
    /// @param upperBound Lower bound for event outcome
    /// @return Returns event contract
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
        if (address(scalarEvents[eventHash]) != 0)
            // Event does exist already
            revert();
        eventContract = new ScalarEvent(
            collateralToken,
            oracle,
            lowerBound,
            upperBound
        );
        scalarEvents[eventHash] = eventContract;
        ScalarEventCreation(msg.sender, eventContract, collateralToken, oracle, lowerBound, upperBound);
    }
}
