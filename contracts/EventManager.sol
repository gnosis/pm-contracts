pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./OracleConsumer.sol";

contract OutcomeToken is MintableToken, StandardBurnableToken {}

contract EventManager is OracleConsumer {
    using SafeMath for uint;

    event EventCreation(bytes32 indexed eventId, address indexed oracle, bytes32 indexed questionId, uint outcomeTokenCount);
    event EventResolution(bytes32 indexed eventId, address indexed oracle, bytes32 indexed questionId, uint outcomeTokenCount, bytes result);
    event OutcomeTokenSetMinting(bytes32 indexed eventId, uint amount);
    event OutcomeTokenSetBurning(bytes32 indexed eventId, uint amount);
    event PayoutRedemption(address indexed redeemer, uint payout);

    ERC20 public collateralToken;
    mapping(bytes32 => uint) public outcomeTokenCounts;
    mapping(bytes32 => OutcomeToken) internal outcomeTokens;
    mapping(bytes32 => uint) public payoutDenominator;
    mapping(address => uint) public payoutForOutcomeToken;

    constructor(ERC20 _collateralToken) public {
        collateralToken = _collateralToken;
    }

    function prepareEvent(address oracle, bytes32 questionId, uint outcomeTokenCount) public {
        bytes32 eventId = keccak256(abi.encodePacked(oracle, questionId, outcomeTokenCount));
        require(outcomeTokenCounts[eventId] == 0, "outcome token set already created");
        outcomeTokenCounts[eventId] = outcomeTokenCount;
        for(uint i = 0; i < outcomeTokenCount; i++) {
            bytes32 outcomeTokenId = keccak256(abi.encodePacked(eventId, i));
            require(outcomeTokens[outcomeTokenId] == OutcomeToken(0), "outcome token already created");
            outcomeTokens[outcomeTokenId] = new OutcomeToken();
        }
        emit EventCreation(eventId, oracle, questionId, outcomeTokenCount);
    }

    function receiveResult(bytes32 questionId, bytes result) external {
        require(result.length > 0, "results empty");
        require(result.length % 32 == 0, "results not 32-byte aligned");
        uint outcomeTokenCount = result.length / 32;
        bytes32 eventId = keccak256(abi.encodePacked(msg.sender, questionId, outcomeTokenCount));
        require(outcomeTokenCounts[eventId] == outcomeTokenCount, "number of outcomes mismatch");
        require(payoutDenominator[eventId] == 0, "payout denominator already set");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            uint payout;
            assembly {
                payout := calldataload(add(0x64, mul(0x20, i)))
            }
            payoutDenominator[eventId] = payoutDenominator[eventId].add(payout);

            OutcomeToken outcomeToken = getOutcomeToken(eventId, i);
            require(payoutForOutcomeToken[outcomeToken] == 0, "payout already set");
            payoutForOutcomeToken[outcomeToken] = payout;
        }
        require(payoutDenominator[eventId] > 0, "payout is all zeroes");
        emit EventResolution(eventId, msg.sender, questionId, outcomeTokenCount, result);
    }

    function mintOutcomeTokenSet(bytes32 eventId, uint amount) public {
        uint outcomeTokenCount = outcomeTokenCounts[eventId];
        require(outcomeTokenCount > 0, "event not prepared yet");
        require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");

        for(uint i = 0; i < outcomeTokenCount; i++) {
            require(getOutcomeToken(eventId, i).mint(msg.sender, amount), "could not mint outcome tokens");
        }
        emit OutcomeTokenSetMinting(eventId, amount);
    }

    function burnOutcomeTokenSet(bytes32 eventId, uint amount) public {
        uint outcomeTokenCount = outcomeTokenCounts[eventId];
        require(outcomeTokenCount > 0, "event not prepared yet");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            getOutcomeToken(eventId, i).burnFrom(msg.sender, amount);
        }
        require(collateralToken.transfer(msg.sender, amount), "could not send collateral tokens");
        emit OutcomeTokenSetBurning(eventId, amount);
    }

    function getOutcomeToken(bytes32 eventId, uint index) public view returns (OutcomeToken) {
        return outcomeTokens[keccak256(abi.encodePacked(eventId, index))];
    }

    function redeemPayout(bytes32 eventId) public {
        uint totalPayout = 0;
        uint outcomeTokenCount = outcomeTokenCounts[eventId];
        require(outcomeTokenCount > 0, "event not prepared yet");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            OutcomeToken ot = getOutcomeToken(eventId, i);
            uint payoutNumerator = payoutForOutcomeToken[ot];
            uint otAmount = ot.allowance(msg.sender, this);
            uint senderBalance = ot.balanceOf(msg.sender);
            if(otAmount > senderBalance) otAmount = senderBalance;
            if(otAmount > 0) {
                ot.burnFrom(msg.sender, otAmount);
                if (payoutNumerator > 0) {
                    totalPayout = totalPayout.add(otAmount.mul(payoutNumerator).div(payoutDenominator[eventId]));
                }
            }
        }
        if (totalPayout > 0) {
            require(collateralToken.transfer(msg.sender, totalPayout), "could not transfer payout to message sender");               
        }
        emit PayoutRedemption(msg.sender, totalPayout);
    }
}
