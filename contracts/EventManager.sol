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

    /// Mapping key is an eventId
    mapping(bytes32 => uint[]) public payoutNumerators;
    mapping(bytes32 => uint) public payoutDenominator;

    /// Mapping key is an outcomeTokenId, composed of (eventId, index) pair
    mapping(bytes32 => OutcomeToken) internal outcomeTokens;

    constructor(ERC20 _collateralToken) public {
        collateralToken = _collateralToken;
    }

    function prepareEvent(address oracle, bytes32 questionId, uint outcomeTokenCount) public {
        bytes32 eventId = keccak256(abi.encodePacked(oracle, questionId, outcomeTokenCount));
        require(payoutNumerators[eventId].length == 0, "event already prepared");
        payoutNumerators[eventId] = new uint[](outcomeTokenCount);
        for(uint i = 0; i < outcomeTokenCount; i++) {
            bytes32 outcomeTokenId = keccak256(abi.encodePacked(eventId, i));
            if(outcomeTokens[outcomeTokenId] == OutcomeToken(0)) {
                createOutcomeToken(outcomeTokenId);
            }
        }
        emit EventCreation(eventId, oracle, questionId, outcomeTokenCount);
    }

    function createOutcomeToken(bytes32 outcomeTokenId) public {
        require(outcomeTokens[outcomeTokenId] == OutcomeToken(0), "outcome token already created");
        outcomeTokens[outcomeTokenId] = new OutcomeToken();
    }

    function receiveResult(bytes32 questionId, bytes result) external {
        require(result.length > 0, "results empty");
        require(result.length % 32 == 0, "results not 32-byte aligned");
        uint outcomeTokenCount = result.length / 32;
        bytes32 eventId = keccak256(abi.encodePacked(msg.sender, questionId, outcomeTokenCount));
        require(payoutNumerators[eventId].length == outcomeTokenCount, "number of outcomes mismatch");
        require(payoutDenominator[eventId] == 0, "payout denominator already set");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            uint payout;
            assembly {
                payout := calldataload(add(0x64, mul(0x20, i)))
            }
            payoutDenominator[eventId] = payoutDenominator[eventId].add(payout);

            require(payoutNumerators[eventId][i] == 0, "payout already set");
            payoutNumerators[eventId][i] = payout;
        }
        require(payoutDenominator[eventId] > 0, "payout is all zeroes");
        emit EventResolution(eventId, msg.sender, questionId, outcomeTokenCount, result);
    }

    function mintOutcomeTokenSet(bytes32 parentTokenId, bytes32 eventId, uint amount) public {
        uint outcomeTokenCount = payoutNumerators[eventId].length;
        require(outcomeTokenCount > 0, "event not prepared yet");

        if(parentTokenId == bytes32(0)) {
            require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");
        } else {
            OutcomeToken parentToken = outcomeTokens[parentTokenId];
            require(outcomeToken != OutcomeToken(0), "required parent token contract not yet created");
            parentToken.burnFrom(msg.sender, amount);
        }

        for(uint i = 0; i < outcomeTokenCount; i++) {
            OutcomeToken outcomeToken = getOutcomeToken(parentTokenId, eventId, i);
            require(outcomeToken != OutcomeToken(0), "required outcome token contract not yet created");
            require(outcomeToken.mint(msg.sender, amount), "could not mint outcome tokens");
        }
        emit OutcomeTokenSetMinting(eventId, amount);
    }

    function burnOutcomeTokenSet(bytes32 parentTokenId, bytes32 eventId, uint amount) public {
        uint outcomeTokenCount = payoutNumerators[eventId].length;
        require(outcomeTokenCount > 0, "event not prepared yet");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            OutcomeToken outcomeToken = getOutcomeToken(parentTokenId, eventId, i);
            require(outcomeToken != OutcomeToken(0), "required outcome token contract not yet created");
            outcomeToken.burnFrom(msg.sender, amount);
        }

        if(parentTokenId == bytes32(0)) {
            require(collateralToken.transfer(msg.sender, amount), "could not send collateral tokens");
        } else {
            OutcomeToken parentToken = outcomeTokens[parentTokenId];
            require(parentToken != OutcomeToken(0), "required parent token contract not yet created");
            require(parentToken.mint(msg.sender, amount), "could not mint parent tokens");
        }

        emit OutcomeTokenSetBurning(eventId, amount);
    }

    function getOutcomeTokenCount(bytes32 eventId) public view returns (uint) {
        return payoutNumerators[eventId].length;
    }

    function getOutcomeToken(bytes32 parentTokenId, bytes32 eventId, uint index) public view returns (OutcomeToken) {
        return outcomeTokens[bytes32(
            uint(parentTokenId) +
            uint(keccak256(abi.encodePacked(eventId, index)))
        )];
    }

    function redeemPayout(bytes32 parentTokenId, bytes32 eventId) public {
        require(payoutDenominator[eventId] > 0, "result for event not received yet");
        uint totalPayout = 0;
        uint outcomeTokenCount = payoutNumerators[eventId].length;
        require(outcomeTokenCount > 0, "event not prepared yet");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            OutcomeToken outcomeToken = getOutcomeToken(parentTokenId, eventId, i);
            uint payoutNumerator = payoutNumerators[eventId][i];
            uint otAmount = outcomeToken.allowance(msg.sender, this);
            uint senderBalance = outcomeToken.balanceOf(msg.sender);
            if(otAmount > senderBalance) otAmount = senderBalance;
            if(otAmount > 0) {
                outcomeToken.burnFrom(msg.sender, otAmount);
                if (payoutNumerator > 0) {
                    totalPayout = totalPayout.add(otAmount.mul(payoutNumerator).div(payoutDenominator[eventId]));
                }
            }
        }
        if (totalPayout > 0) {
            if(parentTokenId == bytes32(0)) {
                require(collateralToken.transfer(msg.sender, totalPayout), "could not transfer payout to message sender");
            } else {
                OutcomeToken parentToken = outcomeTokens[parentTokenId];
                require(parentToken != OutcomeToken(0), "required parent token contract not yet created");
                require(parentToken.mint(msg.sender, totalPayout), "could not mint payout");
            }
        }
        emit PayoutRedemption(msg.sender, totalPayout);
    }
}
