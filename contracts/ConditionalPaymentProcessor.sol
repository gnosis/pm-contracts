pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "erc-1155/contracts/IERC1155.sol";
import "./OracleConsumer.sol";

contract ConditionalPaymentProcessor is OracleConsumer, IERC1155 {
    using SafeMath for uint;
    using AddressUtils for address;

    /// @dev Emitted upon the successful preparation of a condition.
    /// @param conditionId The condition's ID. This ID may be derived from the other three parameters via ``keccak256(abi.encodePacked(oracle, questionId, payoutSlotCount))``.
    /// @param oracle The account assigned to report the result for the prepared condition.
    /// @param questionId An identifier for the question to be answered by the oracle.
    /// @param payoutSlotCount The number of payout slots which should be used for this condition. Must not exceed 256.
    event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint payoutSlotCount);

    event ConditionResolution(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint payoutSlotCount, uint[] payoutNumerators);
    event PositionSplit(address indexed stakeholder, ERC20 collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint[] partition, uint amount);
    event PositionsMerge(address indexed stakeholder, ERC20 collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint[] partition, uint amount);
    event PayoutRedemption(address indexed redeemer, ERC20 indexed collateralToken, bytes32 indexed parentCollectionId, uint payout);

    /// Mapping key is an condition ID. Value represents numerators of the payout vector associated with the condition. This array is initialized with a length equal to the payout slot count.
    mapping(bytes32 => uint[]) public payoutNumerators;
    mapping(bytes32 => uint) public payoutDenominator;

    /// First key is the address of an account holder who has a stake in some payout slot for a condition.
    /// Second key is H(collateralToken . payoutCollectionId), where payoutCollectionId is made by summing up H(conditionId . indexSet).
    /// The result of the mapping is the amount of stake held in a corresponding payout collection by the account holder, where the stake is backed by collateralToken.
    mapping(address => mapping(bytes32 => uint)) internal positions;

    /// @dev This function prepares a condition by initializing a payout vector associated with the condition.
    /// @param oracle The account assigned to report the result for the prepared condition.
    /// @param questionId An identifier for the question to be answered by the oracle.
    /// @param payoutSlotCount The number of payout slots which should be used for this condition. Must not exceed 256.
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

    /// @dev This function splits a position. If splitting from the collateral, this contract will attempt to transfer `amount` collateral from the message sender to itself. Otherwise, this contract will burn `amount` stake held by the message sender in the position being split. Regardless, if successful, `amount` stake will be minted in the split target positions. If any of the transfers, mints, or burns fail, the transaction will revert. The transaction will also revert if the given partition is trivial, invalid, or refers to more slots than the condition is prepared with.
    /// @param collateralToken The address of the positions' backing collateral token.
    /// @param parentCollectionId The ID of the payout collections common to the position being split and the split target positions. May be null, in which only the collateral is shared.
    /// @param conditionId The ID of the condition to split on.
    /// @param partition An array of disjoint index sets representing a nontrivial partition of the payout slots of the given condition.
    /// @param amount The amount of collateral or stake to split.
    function splitPosition(ERC20 collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] partition, uint amount) public {
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
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(parentCollectionId, conditionId, indexSet)));
            // event should go here for collectionId logging?
            positions[msg.sender][key] = positions[msg.sender][key].add(amount);
        }

        if(freeIndexSet == 0) {
            if(parentCollectionId == bytes32(0)) {
                require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");
            } else {
                key = keccak256(abi.encodePacked(collateralToken, parentCollectionId));
                positions[msg.sender][key] = positions[msg.sender][key].sub(amount);
            }
        } else {
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(parentCollectionId, conditionId, fullIndexSet ^ freeIndexSet)));
            positions[msg.sender][key] = positions[msg.sender][key].sub(amount);
        }

        emit PositionSplit(msg.sender, collateralToken, parentCollectionId, conditionId, partition, amount);
    }

    function mergePositions(ERC20 collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] partition, uint amount) public {
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
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(parentCollectionId, conditionId, indexSet)));
            positions[msg.sender][key] = positions[msg.sender][key].sub(amount);
        }

        if(freeIndexSet == 0) {
            if(parentCollectionId == bytes32(0)) {
                require(collateralToken.transfer(msg.sender, amount), "could not send collateral tokens");
            } else {
                key = keccak256(abi.encodePacked(collateralToken, parentCollectionId));
                positions[msg.sender][key] = positions[msg.sender][key].add(amount);
            }
        } else {
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(parentCollectionId, conditionId, fullIndexSet ^ freeIndexSet)));
            positions[msg.sender][key] = positions[msg.sender][key].add(amount);
        }

        emit PositionsMerge(msg.sender, collateralToken, parentCollectionId, conditionId, partition, amount);
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

    function redeemPositions(ERC20 collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] indexSets) public {
        require(payoutDenominator[conditionId] > 0, "result for condition not received yet");
        uint payoutSlotCount = payoutNumerators[conditionId].length;
        require(payoutSlotCount > 0, "condition not prepared yet");

        uint totalPayout = 0;
        bytes32 key;

        uint fullIndexSet = (1 << payoutSlotCount) - 1;
        for(uint i = 0; i < indexSets.length; i++) {
            uint indexSet = indexSets[i];
            require(indexSet > 0 && indexSet < fullIndexSet, "got invalid index set");
            key = keccak256(abi.encodePacked(collateralToken, getPayoutCollectionId(parentCollectionId, conditionId, indexSet)));

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
            if(parentCollectionId == bytes32(0)) {
                require(collateralToken.transfer(msg.sender, totalPayout), "could not transfer payout to message sender");
            } else {
                key = keccak256(abi.encodePacked(collateralToken, parentCollectionId));
                positions[msg.sender][key] = positions[msg.sender][key].add(totalPayout);
            }
        }
        emit PayoutRedemption(msg.sender, collateralToken, parentCollectionId, totalPayout);
    }

    mapping (uint256 => mapping(address => mapping(address => uint256))) internal allowances;

    function transferFrom(address _from, address _to, uint256 _id, uint256 _value) external {
        if(_from != msg.sender) {
            allowances[_id][_from][msg.sender] = allowances[_id][_from][msg.sender].sub(_value);
        }

        positions[_from][bytes32(_id)] = positions[_from][bytes32(_id)].sub(_value);
        positions[_to][bytes32(_id)] = _value.add(positions[_to][bytes32(_id)]);

        emit Transfer(msg.sender, _from, _to, _id, _value);
    }

    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes _data) external {
        this.transferFrom(_from, _to, _id, _value);

        require(_checkAndCallSafeTransfer(_from, _to, _id, _value, _data));
    }

    function approve(address _spender, uint256 _id, uint256 _currentValue, uint256 _value) external {
        // if the allowance isn't 0, it can only be updated to 0 to prevent an allowance change immediately after withdrawal
        require(_value == 0 || allowances[_id][msg.sender][_spender] == _currentValue);
        allowances[_id][msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _id, _currentValue, _value);
    }

    function balanceOf(uint256 _id, address _owner) external view returns (uint256) {
        return positions[_owner][bytes32(_id)];
    }

    function allowance(uint256 _id, address _owner, address _spender) external view returns (uint256) {
        return allowances[_id][_owner][_spender];
    }

    bytes4 constant private ERC1155_RECEIVED = 0xf23a6e61;
    function _checkAndCallSafeTransfer(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes _data
    )
    internal
    returns (bool)
    {
        if (!_to.isContract()) {
            return true;
        }
        bytes4 retval = IERC1155TokenReceiver(_to).onERC1155Received(
            msg.sender, _from, _id, _value, _data);
        return (retval == ERC1155_RECEIVED);
    }
}
