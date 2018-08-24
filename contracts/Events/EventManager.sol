pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./OracleConsumer.sol";

contract OutcomeTokn is MintableToken, StandardBurnableToken {}

contract EventManager is OracleConsumer {
    using SafeMath for uint;

    ERC20 public collateralToken;
    mapping(bytes32 => OutcomeTokn[]) public outcomeTokens;
    mapping(bytes32 => uint) public payoutDenominator;
    mapping(address => uint) public payoutForOutcomeToken;

    function prepareEvent(address oracle, bytes32 questionId, uint numOutcomes) public {
        bytes32 outcomeTokenSetId = keccak256(abi.encodePacked(oracle, questionId, numOutcomes));
        require(outcomeTokens[outcomeTokenSetId].length == 0, "outcome tokens already created");
        outcomeTokens[outcomeTokenSetId] = new OutcomeTokn[](numOutcomes);
        for(uint i = 0; i < numOutcomes; i++) {
            outcomeTokens[outcomeTokenSetId][i] = new OutcomeTokn();
        }
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
    }

    function mintOutcomeTokenSet(bytes32 outcomeTokenSetId, uint amount) public {
        require(outcomeTokens[outcomeTokenSetId].length > 0, "outcome tokens not created yet");
        require(collateralToken.transferFrom(msg.sender, this, amount), "could not receive collateral tokens");
        for(uint i = 0; i < outcomeTokens[outcomeTokenSetId].length; i++) {
            require(outcomeTokens[outcomeTokenSetId][i].mint(msg.sender, amount), "could not mint outcome tokens");
        }
    }

    function burnOutcomeTokenSet(bytes32 outcomeTokenSetId, uint amount) public {
        require(outcomeTokens[outcomeTokenSetId].length > 0, "outcome tokens not created yet");
        for(uint i = 0; i < outcomeTokens[outcomeTokenSetId].length; i++) {
            outcomeTokens[outcomeTokenSetId][i].burnFrom(msg.sender, amount);
        }
        require(collateralToken.transfer(msg.sender, amount), "could not send collateral tokens");
    }
}
