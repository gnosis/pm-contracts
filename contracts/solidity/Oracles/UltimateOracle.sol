pragma solidity 0.4.11;
import "Oracles/AbstractOracle.sol";
import "Tokens/AbstractToken.sol";
import "Utils/Math.sol";


/// @title Ultimate oracle contract - Allows to swap oracle result for ultimate oracle result
/// @author Stefan George - <stefan@gnosis.pm>
contract UltimateOracle is Oracle {

    /*
     *  Storage
     */
    Oracle public oracle;
    Token public collateralToken;
    uint8 public spreadMultiplier;
    uint public challengePeriod;
    uint public challengeAmount;
    uint public frontRunnerPeriod;

    int public outcome;
    uint public outcomeSetTimestamp;
    int public frontRunner;
    uint public frontRunnerSetTimestamp;

    uint public totalAmount;
    mapping (int => uint) public totalOutcomeAmounts;
    mapping (address => mapping (int => uint)) public outcomeAmounts;

    /*
     *  Public functions
     */
    /// @dev Constructor sets Ultimate oracle properties
    /// @param _oracle Oracle address
    /// @param _collateralToken Collateral token address
    /// @param _spreadMultiplier Defines the spread as a multiple of the money bet on other outcomes
    /// @param _challengePeriod Time to challenge oracle outcome
    /// @param _challengeAmount Amount to challenge the outcome
    /// @param _frontRunnerPeriod Time to overbid the front-runner
    function UltimateOracle(
        Oracle _oracle,
        Token _collateralToken,
        uint8 _spreadMultiplier,
        uint _challengePeriod,
        uint _challengeAmount,
        uint _frontRunnerPeriod
    )
        public
    {
        // Validate inputs
        require(   address(_oracle) != 0
                && address(_collateralToken) != 0
                && _spreadMultiplier >= 2
                && _challengePeriod > 0
                && _challengeAmount > 0
                && _frontRunnerPeriod > 0);
        oracle = _oracle;
        collateralToken = _collateralToken;
        spreadMultiplier = _spreadMultiplier;
        challengePeriod = _challengePeriod;
        challengeAmount = _challengeAmount;
        frontRunnerPeriod = _frontRunnerPeriod;
    }

    /// @dev Allows to set oracle outcome
    function setOutcome()
        public
    {
        // There was no challenge and the outcome was not set yet in the ultimate oracle but in the forwarded oracle
        require(   !isChallenged()
                && outcomeSetTimestamp == 0
                && oracle.isOutcomeSet());
        outcome = oracle.getOutcome();
        outcomeSetTimestamp = now;
    }

    /// @dev Allows to challenge the oracle outcome
    /// @param _outcome Outcome to bid on
    function challengeOutcome(int _outcome)
        public
    {
        // Challenged outcome is different from voted outcome and there was no challenge yet or the challenge period expired
        require(   _outcome != outcome
                && !isChallenged()
                && !isChallengePeriodOver()
                && collateralToken.transferFrom(msg.sender, this, challengeAmount));
        outcomeAmounts[msg.sender][_outcome] = challengeAmount;
        totalOutcomeAmounts[_outcome] = challengeAmount;
        totalAmount = challengeAmount;
        frontRunner = _outcome;
        frontRunnerSetTimestamp = now;
    }

    /// @dev Allows to challenge the oracle outcome
    /// @param _outcome Outcome to bid on
    /// @param amount Amount to bid
    function voteForOutcome(int _outcome, uint amount)
        public
    {
        uint maxAmount =   Math.mul((totalAmount - totalOutcomeAmounts[_outcome]), spreadMultiplier)
                         - totalOutcomeAmounts[_outcome];
        if (amount > maxAmount)
            amount = maxAmount;
        // Outcome is challenged and front runner period is not over yet and tokens can be transferred
        require(   isChallenged()
                && !isFrontRunnerPeriodOver()
                && collateralToken.transferFrom(msg.sender, this, amount));
        outcomeAmounts[msg.sender][_outcome] = Math.add(outcomeAmounts[msg.sender][_outcome], amount);
        totalOutcomeAmounts[_outcome] = Math.add(totalOutcomeAmounts[_outcome], amount);
        totalAmount = Math.add(totalAmount, amount);
        if (_outcome != frontRunner && totalOutcomeAmounts[_outcome] > totalOutcomeAmounts[frontRunner])
        {
            frontRunner = _outcome;
            frontRunnerSetTimestamp = now;
        }
    }

    /// @dev Withdraws winnings for user
    /// @return Returns winnings
    function withdraw()
        public
        returns (uint amount)
    {
        // Outcome was challenged and ultimate outcome decided
        require(isFrontRunnerPeriodOver());
        amount = Math.mul(totalAmount, outcomeAmounts[msg.sender][frontRunner]) / totalOutcomeAmounts[frontRunner];
        outcomeAmounts[msg.sender][frontRunner] = 0;
        // Transfer earnings to contributor
        require(collateralToken.transfer(msg.sender, amount));
    }

    /// @dev Checks if time to challenge the outcome is over
    /// @return Returns if challenge period is over
    function isChallengePeriodOver()
        public
        returns (bool)
    {
        return outcomeSetTimestamp != 0 && now - outcomeSetTimestamp > challengePeriod;
    }

    /// @dev Checks if time to overbid the front runner is over
    /// @return Returns if front runner period is over
    function isFrontRunnerPeriodOver()
        public
        returns (bool)
    {
        return frontRunnerSetTimestamp != 0 && now - frontRunnerSetTimestamp > frontRunnerPeriod;
    }

    /// @dev Checks if outcome was challenged
    /// @return Returns if outcome was challenged
    function isChallenged()
        public
        returns (bool)
    {
        return frontRunnerSetTimestamp != 0;
    }

    /// @dev Returns if winning outcome is set for given event
    /// @return Returns if outcome is set
    function isOutcomeSet()
        public
        constant
        returns (bool)
    {
        return    isChallengePeriodOver() && !isChallenged()
               || isFrontRunnerPeriodOver();
    }

    /// @dev Returns winning outcome for given event
    /// @return Returns outcome
    function getOutcome()
        public
        constant
        returns (int)
    {
        if (isFrontRunnerPeriodOver())
            return frontRunner;
        return outcome;
    }
}
