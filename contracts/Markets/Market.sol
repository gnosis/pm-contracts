pragma solidity 0.4.18;
import "../Events/Event.sol";
import "../MarketMakers/MarketMaker.sol";


/// @title Abstract market contract - Functions to be implemented by market contracts
contract Market {

    /*
     *  Events
     */
    event MarketFunding(uint funding);
    event MarketClosing();
    event FeeWithdrawal(uint fees);
    event OutcomeTokenTrade(address indexed transactor, int[] outcomeTokenAmounts, int outcomeTokenNetCost, uint marketFees);

    /*
     *  Storage
     */
    address public creator;
    uint public createdAtBlock;
    Event public eventContract;
    MarketMaker public marketMaker;
    uint24 public fee;
    uint public funding;
    int[] public netOutcomeTokensSold;
    Stages public stage;

    enum Stages {
        MarketCreated,
        MarketFunded,
        MarketClosed
    }

    /*
     *  Public functions
     */
    function fund(uint _funding) public;
    function close() public;
    function withdrawFees() public returns (uint);
    function trade(int[] outcomeTokenAmounts, int costLimit) public returns (int);
    function calcMarketFee(uint outcomeTokenCost) public view returns (uint);
}
