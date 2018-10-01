pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./OracleConsumer.sol";

contract ConditionalPaymentProcessor is OracleConsumer {
    using SafeMath for uint;

    event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint payoutSlotCount);
    event ConditionResolution(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint payoutSlotCount, bytes result);
    event PositionSplit(address indexed stakeholder, bytes32 indexed splitSlotId, bytes32 indexed conditionId, uint amount);
    event PositionMerge(address indexed stakeholder, bytes32 indexed mergedSlotId, bytes32 indexed conditionId, uint amount);
    event PayoutRedemption(address indexed redeemer, uint payout);

    ERC20 public collateralToken;

    /// Mapping key is an conditionId
    mapping(bytes32 => uint[]) public payoutNumerators;
    mapping(bytes32 => uint) public payoutDenominator;

    /// First key is the address of an account holder who has a stake in some payout slot for a condition.
    /// Second key is an payoutSlotId, composed of (conditionId, index) pair.
    /// The result of the mapping is the amount of stake held in a corresponding payout slot by the account holder.
    mapping(address => mapping(bytes32 => uint)) internal positions;

    constructor(ERC20 _collateralToken) public {
        collateralToken = _collateralToken;
    }

    function prepareCondition(address oracle, bytes32 questionId, uint payoutSlotCount) public {
        bytes32 conditionId = keccak256(abi.encodePacked(oracle, questionId, payoutSlotCount));
        require(payoutNumerators[conditionId].length == 0, "condition already prepared");
        payoutNumerators[conditionId] = new uint[](payoutSlotCount);
        emit ConditionPreparation(conditionId, oracle, questionId, payoutSlotCount);
    }

    function receiveResult(bytes32 questionId, bytes result) external {
        require(result.length > 0, "results empty");
        require(result.length % 32 == 0, "results not 32-byte aligned");
        uint payoutSlotCount = result.length / 32;
        bytes32 conditionId = keccak256(abi.encodePacked(msg.sender, questionId, payoutSlotCount));
        require(payoutNumerators[conditionId].length == payoutSlotCount, "number of outcomes mismatch");
        require(payoutDenominator[conditionId] == 0, "payout denominator already set");
        for(uint i = 0; i < payoutSlotCount; i++) {
            uint payout;
            assembly {
                payout := calldataload(add(0x64, mul(0x20, i)))
            }
            payoutDenominator[conditionId] = payoutDenominator[conditionId].add(payout);

            require(payoutNumerators[conditionId][i] == 0, "payout already set");
            payoutNumerators[conditionId][i] = payout;
        }
        require(payoutDenominator[conditionId] > 0, "payout is all zeroes");
        emit ConditionResolution(conditionId, msg.sender, questionId, payoutSlotCount, result);
    }

    function splitPosition(bytes32 splitSlotId, bytes32 conditionId, uint amount) public {
        uint payoutSlotCount = payoutNumerators[conditionId].length;
        require(payoutSlotCount > 0, "condition not prepared yet");

        if(splitSlotId == bytes32(0)) {
            require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");
        } else {
            positions[msg.sender][splitSlotId] = positions[msg.sender][splitSlotId].sub(amount);
        }

        for(uint i = 0; i < payoutSlotCount; i++) {
            bytes32 slotId = getPayoutSlotId(splitSlotId, conditionId, i);
            positions[msg.sender][slotId] = positions[msg.sender][slotId].add(amount);
        }
        emit PositionSplit(msg.sender, splitSlotId, conditionId, amount);
    }

    function mergePosition(bytes32 mergedSlotId, bytes32 conditionId, uint amount) public {
        uint payoutSlotCount = payoutNumerators[conditionId].length;
        require(payoutSlotCount > 0, "condition not prepared yet");

        for(uint i = 0; i < payoutSlotCount; i++) {
            bytes32 slotId = getPayoutSlotId(mergedSlotId, conditionId, i);
            positions[msg.sender][slotId] = positions[msg.sender][slotId].sub(amount);
        }

        if(mergedSlotId == bytes32(0)) {
            require(collateralToken.transfer(msg.sender, amount), "could not send collateral tokens");
        } else {
            positions[msg.sender][mergedSlotId] = positions[msg.sender][mergedSlotId].add(amount);
        }

        emit PositionMerge(msg.sender, mergedSlotId, conditionId, amount);
    }

    function getPayoutSlotCount(bytes32 conditionId) public view returns (uint) {
        return payoutNumerators[conditionId].length;
    }

    function getPayoutSlotId(bytes32 parentSlotId, bytes32 conditionId, uint index) public pure returns (bytes32) {
        return bytes32(
            uint(parentSlotId) +
            uint(keccak256(abi.encodePacked(conditionId, index)))
        );
    }

    function redeemPayout(bytes32 redeemedSlotId, bytes32 conditionId) public {
        require(payoutDenominator[conditionId] > 0, "result for condition not received yet");
        uint totalPayout = 0;
        uint payoutSlotCount = payoutNumerators[conditionId].length;
        require(payoutSlotCount > 0, "condition not prepared yet");
        for(uint i = 0; i < payoutSlotCount; i++) {
            bytes32 slotId = getPayoutSlotId(redeemedSlotId, conditionId, i);
            uint payoutNumerator = payoutNumerators[conditionId][i];
            uint payoutStake = positions[msg.sender][slotId];
            if(payoutStake > 0) {
                totalPayout = totalPayout.add(payoutStake.mul(payoutNumerator).div(payoutDenominator[conditionId]));
                positions[msg.sender][slotId] = 0;
            }
        }
        if (totalPayout > 0) {
            if(redeemedSlotId == bytes32(0)) {
                require(collateralToken.transfer(msg.sender, totalPayout), "could not transfer payout to message sender");
            } else {
                positions[msg.sender][redeemedSlotId] = positions[msg.sender][redeemedSlotId].add(totalPayout);
            }
        }
        emit PayoutRedemption(msg.sender, totalPayout);
    }
}
