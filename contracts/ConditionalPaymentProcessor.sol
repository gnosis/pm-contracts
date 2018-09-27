pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./OracleConsumer.sol";

contract OutcomeToken is MintableToken, StandardBurnableToken {}

contract ConditionalPaymentProcessor is OracleConsumer {
    using SafeMath for uint;

    event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint outcomeTokenCount);
    event ConditionResolution(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint outcomeTokenCount, bytes result);
    event OutcomeTokenSetMinting(bytes32 indexed conditionId, uint amount);
    event OutcomeTokenSetBurning(bytes32 indexed conditionId, uint amount);
    event PayoutRedemption(address indexed redeemer, uint payout);

    ERC20 public collateralToken;

    /// Mapping key is an conditionId
    mapping(bytes32 => uint[]) public payoutNumerators;
    mapping(bytes32 => uint) public payoutDenominator;

    /// Mapping key is an outcomeTokenId, composed of (conditionId, index) pair
    mapping(bytes32 => OutcomeToken) internal outcomeTokens;

    constructor(ERC20 _collateralToken) public {
        collateralToken = _collateralToken;
    }

    function prepareCondition(address oracle, bytes32 questionId, uint outcomeTokenCount) public {
        bytes32 conditionId = keccak256(abi.encodePacked(oracle, questionId, outcomeTokenCount));
        require(payoutNumerators[conditionId].length == 0, "condition already prepared");
        payoutNumerators[conditionId] = new uint[](outcomeTokenCount);
        for(uint i = 0; i < outcomeTokenCount; i++) {
            bytes32 outcomeTokenId = keccak256(abi.encodePacked(conditionId, i));
            if(outcomeTokens[outcomeTokenId] == OutcomeToken(0)) {
                createOutcomeToken(outcomeTokenId);
            }
        }
        emit ConditionPreparation(conditionId, oracle, questionId, outcomeTokenCount);
    }

    function createOutcomeToken(bytes32 outcomeTokenId) public {
        require(outcomeTokens[outcomeTokenId] == OutcomeToken(0), "outcome token already created");
        outcomeTokens[outcomeTokenId] = new OutcomeToken();
    }

    function receiveResult(bytes32 questionId, bytes result) external {
        require(result.length > 0, "results empty");
        require(result.length % 32 == 0, "results not 32-byte aligned");
        uint outcomeTokenCount = result.length / 32;
        bytes32 conditionId = keccak256(abi.encodePacked(msg.sender, questionId, outcomeTokenCount));
        require(payoutNumerators[conditionId].length == outcomeTokenCount, "number of outcomes mismatch");
        require(payoutDenominator[conditionId] == 0, "payout denominator already set");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            uint payout;
            assembly {
                payout := calldataload(add(0x64, mul(0x20, i)))
            }
            payoutDenominator[conditionId] = payoutDenominator[conditionId].add(payout);

            require(payoutNumerators[conditionId][i] == 0, "payout already set");
            payoutNumerators[conditionId][i] = payout;
        }
        require(payoutDenominator[conditionId] > 0, "payout is all zeroes");
        emit ConditionResolution(conditionId, msg.sender, questionId, outcomeTokenCount, result);
    }

    function mintOutcomeTokenSet(bytes32 parentTokenId, bytes32 conditionId, uint amount) public {
        uint outcomeTokenCount = payoutNumerators[conditionId].length;
        require(outcomeTokenCount > 0, "condition not prepared yet");

        if(parentTokenId == bytes32(0)) {
            require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");
        } else {
            OutcomeToken parentToken = outcomeTokens[parentTokenId];
            require(outcomeToken != OutcomeToken(0), "required parent token contract not yet created");
            parentToken.burnFrom(msg.sender, amount);
        }

        for(uint i = 0; i < outcomeTokenCount; i++) {
            OutcomeToken outcomeToken = getOutcomeToken(parentTokenId, conditionId, i);
            require(outcomeToken != OutcomeToken(0), "required outcome token contract not yet created");
            require(outcomeToken.mint(msg.sender, amount), "could not mint outcome tokens");
        }
        emit OutcomeTokenSetMinting(conditionId, amount);
    }

    function burnOutcomeTokenSet(bytes32 parentTokenId, bytes32 conditionId, uint amount) public {
        uint outcomeTokenCount = payoutNumerators[conditionId].length;
        require(outcomeTokenCount > 0, "condition not prepared yet");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            OutcomeToken outcomeToken = getOutcomeToken(parentTokenId, conditionId, i);
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

        emit OutcomeTokenSetBurning(conditionId, amount);
    }

    function getOutcomeTokenCount(bytes32 conditionId) public view returns (uint) {
        return payoutNumerators[conditionId].length;
    }

    function getOutcomeToken(bytes32 parentTokenId, bytes32 conditionId, uint index) public view returns (OutcomeToken) {
        return outcomeTokens[bytes32(
            uint(parentTokenId) +
            uint(keccak256(abi.encodePacked(conditionId, index)))
        )];
    }

    function redeemPayout(bytes32 parentTokenId, bytes32 conditionId) public {
        require(payoutDenominator[conditionId] > 0, "result for condition not received yet");
        uint totalPayout = 0;
        uint outcomeTokenCount = payoutNumerators[conditionId].length;
        require(outcomeTokenCount > 0, "condition not prepared yet");
        for(uint i = 0; i < outcomeTokenCount; i++) {
            OutcomeToken outcomeToken = getOutcomeToken(parentTokenId, conditionId, i);
            uint payoutNumerator = payoutNumerators[conditionId][i];
            uint otAmount = outcomeToken.allowance(msg.sender, this);
            uint senderBalance = outcomeToken.balanceOf(msg.sender);
            if(otAmount > senderBalance) otAmount = senderBalance;
            if(otAmount > 0) {
                outcomeToken.burnFrom(msg.sender, otAmount);
                if (payoutNumerator > 0) {
                    totalPayout = totalPayout.add(otAmount.mul(payoutNumerator).div(payoutDenominator[conditionId]));
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
