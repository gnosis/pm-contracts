pragma solidity ^0.5.0;
import "../Events/Event.sol";
import "../MarketMakers/MarketMaker.sol";
import "@gnosis.pm/util-contracts/contracts/Proxy.sol";


contract MarketData {
    /*
     *  Events
     */
    event MarketFunding(uint funding);
    event MarketClosing();
    event FeeWithdrawal(uint fees);
    event OutcomeTokenPurchase(address indexed buyer, uint8 outcomeTokenIndex, uint outcomeTokenCount, uint outcomeTokenCost, uint marketFees);
    event OutcomeTokenSale(address indexed seller, uint8 outcomeTokenIndex, uint outcomeTokenCount, uint outcomeTokenProfit, uint marketFees);
    event OutcomeTokenShortSale(address indexed buyer, uint8 outcomeTokenIndex, uint outcomeTokenCount, uint cost);
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
}

/// @title Abstract market contract - Functions to be implemented by market contracts
contract Market is MarketData {
    /*
     *  Public functions
     */
    function fund(uint _funding) public;
    function close() public;
    function withdrawFees() public returns (uint);
    function buy(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint maxCost) public returns (uint);
    function sell(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint minProfit) public returns (uint);
    function shortSell(uint8 outcomeTokenIndex, uint outcomeTokenCount, uint minProfit) public returns (uint);
    function trade(int[] memory outcomeTokenAmounts, int costLimit) public returns (int);
    function calcMarketFee(uint outcomeTokenCost) public view returns (uint);
}
