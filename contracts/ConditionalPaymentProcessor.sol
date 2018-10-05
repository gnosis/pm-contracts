pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./OracleConsumer.sol";

contract ConditionalPaymentProcessor is OracleConsumer {
    using SafeMath for uint;

    event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint payoutSlotCount);
    event ConditionResolution(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint payoutSlotCount, uint[] payoutNumerators);
    event PositionSplit(address indexed stakeholder, ERC20 collateralToken, bytes32 indexed splitCollectionId, bytes32 indexed conditionId, uint[] partition, uint amount);
    event PositionMerge(address indexed stakeholder, ERC20 collateralToken, bytes32 indexed mergedCollectionId, bytes32 indexed conditionId, uint[] partition, uint amount);
    event PayoutRedemption(address indexed redeemer, ERC20 indexed collateralToken, bytes32 indexed redeemedCollectionId, uint payout);

    /// Mapping key is an conditionId, where conditionId is made by H(oracle . questionId . payoutSlotCount)
    mapping(bytes32 => uint[]) public payoutNumerators;
    mapping(bytes32 => uint) public payoutDenominator;

    /// First key is the address of an account holder who has a stake in some payout slot for a condition.
    /// Second key is H(collateralToken . payoutCollectionId), where payoutCollectionId is made by summing up H(conditionId . indexSet).
    /// The result of the mapping is the amount of stake held in a corresponding payout collection by the account holder, where the stake is backed by collateralToken.
    mapping(address => mapping(bytes32 => uint)) internal positions;

    function prepareCondition(address oracle, bytes32 questionId, uint payoutSlotCount) public {
        require(payoutSlotCount <= 256, "too many payout slots");
        bytes32 conditionId = keccak256(abi.encodePacked(oracle, questionId, payoutSlotCount));
        require(payoutNumerators[conditionId].length == 0, "condition already prepared");
        payoutNumerators[conditionId] = new uint[](payoutSlotCount);
        emit ConditionPreparation(conditionId, oracle, questionId, payoutSlotCount);
    }

    function receiveResult(bytes32 questionId, bytes result) external {
        require(result.length > 0, "results empty");
        require(result.length % 32 == 0, "results not 32-byte aligned");
        uint payoutSlotCount = result.length / 32;
        require(payoutSlotCount <= 256, "too many payout slots");
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
        emit ConditionResolution(conditionId, msg.sender, questionId, payoutSlotCount, payoutNumerators[conditionId]);
    }

    function splitPosition(ERC20 collateralToken, bytes32 splitCollectionId, bytes32 conditionId, uint[] partition, uint amount) public {
        uint payoutSlotCount = payoutNumerators[conditionId].length;
        require(payoutSlotCount > 0, "condition not prepared yet");

        bytes32 key;

        uint fullIndexSet = (1 << payoutSlotCount) - 1;
        uint freeIndexSet = fullIndexSet;
        for(uint i = 0; i < partition.length; i++) {
            uint indexSet = partition[i];
            require(indexSet > 0 && indexSet < fullIndexSet, "got invalid index set");
            require((indexSet & freeIndexSet) == indexSet, "partition not disjoint");
            freeIndexSet ^= indexSet;
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(splitCollectionId, conditionId, indexSet)));
            positions[msg.sender][key] = positions[msg.sender][key].add(amount);
        }

        if(freeIndexSet == 0) {
            if(splitCollectionId == bytes32(0)) {
                require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");
            } else {
                key = keccak256(abi.encodePacked(collateralToken, splitCollectionId));
                positions[msg.sender][key] = positions[msg.sender][key].sub(amount);
            }
        } else {
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(splitCollectionId, conditionId, fullIndexSet ^ freeIndexSet)));
            positions[msg.sender][key] = positions[msg.sender][key].sub(amount);
        }

        emit PositionSplit(msg.sender, collateralToken, splitCollectionId, conditionId, partition, amount);
    }

    function mergePosition(ERC20 collateralToken, bytes32 mergedCollectionId, bytes32 conditionId, uint[] partition, uint amount) public {
        uint payoutSlotCount = payoutNumerators[conditionId].length;
        require(payoutSlotCount > 0, "condition not prepared yet");

        bytes32 key;

        uint fullIndexSet = (1 << payoutSlotCount) - 1;
        uint freeIndexSet = fullIndexSet;
        for(uint i = 0; i < partition.length; i++) {
            uint indexSet = partition[i];
            require(indexSet > 0 && indexSet < fullIndexSet, "got invalid index set");
            require((indexSet & freeIndexSet) == indexSet, "partition not disjoint");
            freeIndexSet ^= indexSet;
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(mergedCollectionId, conditionId, indexSet)));
            positions[msg.sender][key] = positions[msg.sender][key].sub(amount);
        }

        if(freeIndexSet == 0) {
            if(mergedCollectionId == bytes32(0)) {
                require(collateralToken.transfer(msg.sender, amount), "could not send collateral tokens");
            } else {
                key = keccak256(abi.encodePacked(collateralToken, mergedCollectionId));
                positions[msg.sender][key] = positions[msg.sender][key].add(amount);
            }
        } else {
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(mergedCollectionId, conditionId, fullIndexSet ^ freeIndexSet)));
            positions[msg.sender][key] = positions[msg.sender][key].add(amount);
        }

        emit PositionMerge(msg.sender, collateralToken, mergedCollectionId, conditionId, partition, amount);
    }

    function getPayoutSlotCount(bytes32 conditionId) public view returns (uint) {
        return payoutNumerators[conditionId].length;
    }

    function getPayoutCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint indexSet) public pure returns (bytes32) {
        return bytes32(
            uint(parentCollectionId) +
            uint(keccak256(abi.encodePacked(conditionId, indexSet)))
        );
    }

    function redeemPayout(ERC20 collateralToken, bytes32 redeemedCollectionId, bytes32 conditionId, uint[] indexSets) public {
        require(payoutDenominator[conditionId] > 0, "result for condition not received yet");
        uint payoutSlotCount = payoutNumerators[conditionId].length;
        require(payoutSlotCount > 0, "condition not prepared yet");

        uint totalPayout = 0;
        bytes32 key;

        uint fullIndexSet = (1 << payoutSlotCount) - 1;
        for(uint i = 0; i < indexSets.length; i++) {
            uint indexSet = indexSets[i];
            require(indexSet > 0 && indexSet < fullIndexSet, "got invalid index set");
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(redeemedCollectionId, conditionId, indexSet)));

            uint payoutNumerator = 0;
            for(uint j = 0; j < payoutSlotCount; j++) {
                if(indexSet & (1 << j) != 0) {
                    payoutNumerator = payoutNumerator.add(payoutNumerators[conditionId][j]);
                }
            }

            uint payoutStake = positions[msg.sender][key];
            if(payoutStake > 0) {
                totalPayout = totalPayout.add(payoutStake.mul(payoutNumerator).div(payoutDenominator[conditionId]));
                positions[msg.sender][key] = 0;
            }
        }

        if (totalPayout > 0) {
            if(redeemedCollectionId == bytes32(0)) {
                require(collateralToken.transfer(msg.sender, totalPayout), "could not transfer payout to message sender");
            } else {
                key = keccak256(abi.encodePacked(collateralToken, redeemedCollectionId));
                positions[msg.sender][key] = positions[msg.sender][key].add(totalPayout);
            }
        }
        emit PayoutRedemption(msg.sender, collateralToken, redeemedCollectionId, totalPayout);
    }
}
