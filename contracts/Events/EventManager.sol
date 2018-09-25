pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./OracleConsumer.sol";

contract OutcomeToken is MintableToken, StandardBurnableToken {}

contract EventManager is OracleConsumer {
    using SafeMath for uint;

    event EventCreation(bytes32 indexed outcomeTokenSetId, address indexed oracle, bytes32 indexed questionId, uint numOutcomes);
    event EventResolution(bytes32 indexed outcomeTokenSetId, address indexed oracle, bytes32 indexed questionId, uint numOutcomes, bytes result);
    event OutcomeTokenSetMinting(bytes32 indexed outcomeTokenSetId, uint amount);
    event OutcomeTokenSetBurning(bytes32 indexed outcomeTokenSetId, uint amount);
    event PayoutRedemption(address indexed redeemer, uint payout);

    ERC20 public collateralToken;
    mapping(bytes32 => OutcomeToken[]) public outcomeTokens;
    mapping(bytes32 => uint) public payoutDenominator;
    mapping(address => uint) public payoutForOutcomeToken;

    constructor(ERC20 _collateralToken) public {
        collateralToken = _collateralToken;
    }

    function prepareEvent(address oracle, bytes32 questionId, uint numOutcomes) public {
        bytes32 outcomeTokenSetId = keccak256(abi.encodePacked(oracle, questionId, numOutcomes));
        require(outcomeTokens[outcomeTokenSetId].length == 0, "outcome tokens already created");
        outcomeTokens[outcomeTokenSetId] = new OutcomeToken[](numOutcomes);
        for(uint i = 0; i < numOutcomes; i++) {
            outcomeTokens[outcomeTokenSetId][i] = new OutcomeToken();
        }
        emit EventCreation(outcomeTokenSetId, oracle, questionId, numOutcomes);
    }

    function receiveResult(bytes32 questionId, bytes result) external {
        require(result.length > 0, "results empty");
        require(result.length % 32 == 0, "results not 32-byte aligned");
        uint numOutcomes = result.length / 32;
        bytes32 outcomeTokenSetId = keccak256(abi.encodePacked(msg.sender, questionId, numOutcomes));
        require(outcomeTokens[outcomeTokenSetId].length == numOutcomes, "number of outcomes mismatch");
        require(payoutDenominator[outcomeTokenSetId] == 0, "payout denominator already set");
        for(uint i = 0; i < numOutcomes; i++) {
            uint payout;
            assembly {
                payout := calldataload(add(0x64, mul(0x20, i)))
            }
            payoutDenominator[outcomeTokenSetId] = payoutDenominator[outcomeTokenSetId].add(payout);

            require(payoutForOutcomeToken[outcomeTokens[outcomeTokenSetId][i]] == 0, "payout already set");
            payoutForOutcomeToken[outcomeTokens[outcomeTokenSetId][i]] = payout;
        }
        require(payoutDenominator[outcomeTokenSetId] > 0, "payout is all zeroes");
        emit EventResolution(outcomeTokenSetId, msg.sender, questionId, numOutcomes, result);
    }

    function mintOutcomeTokenSet(bytes32 outcomeTokenSetId, uint amount) public {
        require(outcomeTokens[outcomeTokenSetId].length > 0, "outcome tokens not created yet");
        require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");
        for(uint i = 0; i < outcomeTokens[outcomeTokenSetId].length; i++) {
            require(outcomeTokens[outcomeTokenSetId][i].mint(msg.sender, amount), "could not mint outcome tokens");
        }
        emit OutcomeTokenSetMinting(outcomeTokenSetId, amount);
    }

    function burnOutcomeTokenSet(bytes32 outcomeTokenSetId, uint amount) public {
        require(outcomeTokens[outcomeTokenSetId].length > 0, "outcome tokens not created yet");
        for(uint i = 0; i < outcomeTokens[outcomeTokenSetId].length; i++) {
            outcomeTokens[outcomeTokenSetId][i].burnFrom(msg.sender, amount);
        }
        require(collateralToken.transfer(msg.sender, amount), "could not send collateral tokens");
        emit OutcomeTokenSetBurning(outcomeTokenSetId, amount);
    }

    function getOutcomeTokenSetLength(bytes32 outcomeTokenSetId) public view returns (uint) {
        return outcomeTokens[outcomeTokenSetId].length;
    }

    function redeemPayout(bytes32 outcomeTokenSetId) public {
        uint totalPayout = 0;
        for(uint i = 0; i < outcomeTokens[outcomeTokenSetId].length; i++) {
            OutcomeToken ot = outcomeTokens[outcomeTokenSetId][i];
            uint payoutNumerator = payoutForOutcomeToken[ot];
            uint otAmount = ot.allowance(msg.sender, this);
            uint senderBalance = ot.balanceOf(msg.sender);
            if(otAmount > senderBalance) otAmount = senderBalance;
            if(otAmount > 0) {
                ot.burnFrom(msg.sender, otAmount);
                if(payoutNumerator > 0) {
                    uint payout = otAmount.mul(payoutNumerator)
                        .div(payoutDenominator[outcomeTokenSetId]);
                    require(collateralToken.transfer(msg.sender, payout),
                        "could not transfer payout to message sender");
                    totalPayout += payout;
                }
            }
        }
        emit PayoutRedemption(msg.sender, totalPayout);
    }
}
