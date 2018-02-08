* [UltimateOracle](#ultimateoracle)
  * [Accessors](#ultimateoracle-accessors)
  * [Events](#ultimateoracle-events)
    * [ForwardedOracleOutcomeAssignment(*int256* `outcome`)](#forwardedoracleoutcomeassignmentint256-outcome)
    * [OutcomeChallenge(*address* indexed `sender`, *int256* `outcome`)](#outcomechallengeaddress-indexed-sender-int256-outcome)
    * [OutcomeVote(*address* indexed `sender`, *int256* `outcome`, *uint256* `amount`)](#outcomevoteaddress-indexed-sender-int256-outcome-uint256-amount)
    * [Withdrawal(*address* indexed `sender`, *uint256* `amount`)](#withdrawaladdress-indexed-sender-uint256-amount)
  * [Functions](#ultimateoracle-functions)
    * [isFrontRunnerPeriodOver()](#isfrontrunnerperiodover)
    * [withdraw()](#withdraw)
    * [isChallengePeriodOver()](#ischallengeperiodover)
    * [setForwardedOutcome()](#setforwardedoutcome)
    * [getOutcome()](#getoutcome)
    * [isChallenged()](#ischallenged)
    * [challengeOutcome(*int256* `_outcome`)](#challengeoutcomeint256-_outcome)
    * [isOutcomeSet()](#isoutcomeset)
    * [voteForOutcome(*int256* `_outcome`, *uint256* `amount`)](#voteforoutcomeint256-_outcome-uint256-amount)
* [UltimateOracleData](#ultimateoracledata)
  * [Accessors](#ultimateoracledata-accessors)
  * [Events](#ultimateoracledata-events)
    * [ForwardedOracleOutcomeAssignment(*int256* `outcome`)](#forwardedoracleoutcomeassignmentint256-outcome)
    * [OutcomeChallenge(*address* indexed `sender`, *int256* `outcome`)](#outcomechallengeaddress-indexed-sender-int256-outcome)
    * [OutcomeVote(*address* indexed `sender`, *int256* `outcome`, *uint256* `amount`)](#outcomevoteaddress-indexed-sender-int256-outcome-uint256-amount)
    * [Withdrawal(*address* indexed `sender`, *uint256* `amount`)](#withdrawaladdress-indexed-sender-uint256-amount)
* [UltimateOracleProxy](#ultimateoracleproxy)
  * [Accessors](#ultimateoracleproxy-accessors)
  * [Events](#ultimateoracleproxy-events)
    * [ForwardedOracleOutcomeAssignment(*int256* `outcome`)](#forwardedoracleoutcomeassignmentint256-outcome)
    * [OutcomeChallenge(*address* indexed `sender`, *int256* `outcome`)](#outcomechallengeaddress-indexed-sender-int256-outcome)
    * [OutcomeVote(*address* indexed `sender`, *int256* `outcome`, *uint256* `amount`)](#outcomevoteaddress-indexed-sender-int256-outcome-uint256-amount)
    * [Withdrawal(*address* indexed `sender`, *uint256* `amount`)](#withdrawaladdress-indexed-sender-uint256-amount)

# UltimateOracle

### Ultimate oracle contract - Allows to swap oracle result for ultimate oracle result

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: UltimateOracle()
- This contract does **not** have a fallback function.

## UltimateOracle Accessors

* *address* forwardedOracle() `061a85c7`
* *uint256* frontRunnerPeriod() `0853f7eb`
* *int256* frontRunner() `0f3e9438`
* *uint256* totalAmount() `1a39d8ef`
* *uint256* totalOutcomeAmounts(*int256*) `1ff14311`
* *uint256* forwardedOutcomeSetTimestamp() `466ae314`
* *uint256* frontRunnerSetTimestamp() `8ef8125e`
* *int256* forwardedOutcome() `984a470a`
* *uint256* challengeAmount() `9d89e7d4`
* *address* masterCopy() `a619486e`
* *address* collateralToken() `b2016bd4`
* *uint256* outcomeAmounts(*address*, *int256*) `c427af9b`
* *uint8* spreadMultiplier() `d84d2a47`
* *uint256* challengePeriod() `f3f480d9`

## UltimateOracle Events

### ForwardedOracleOutcomeAssignment(*int256* `outcome`)

**Signature hash**: `6eab3db94ac766c1ac203bcd9c9636476993422eaa067ad449e20ce8501b2a8f`

### OutcomeChallenge(*address* indexed `sender`, *int256* `outcome`)

**Signature hash**: `d0fdeb84e66d569a89718f40a99496b38d6c13249a9c9f623fbaa3d8ef343a9d`

### OutcomeVote(*address* indexed `sender`, *int256* `outcome`, *uint256* `amount`)

**Signature hash**: `86fa706979a07f1dd01a49718016881d95ada425549c353ec9e55a627b98a93b`

### Withdrawal(*address* indexed `sender`, *uint256* `amount`)

**Signature hash**: `7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65`

## UltimateOracle Functions

### isFrontRunnerPeriodOver()

- **State mutability**: `view`
- **Signature hash**: `1a4f5b67`

Checks if time to overbid the front runner is over

#### Outputs

| type   | description                  |
| ------ | ---------------------------- |
| *bool* | Is front runner period over? |

### withdraw()

- **State mutability**: `nonpayable`
- **Signature hash**: `3ccfd60b`

Withdraws winnings for user

#### Outputs

| type      | name     | description |
| --------- | -------- | ----------- |
| *uint256* | `amount` | Winnings    |

### isChallengePeriodOver()

- **State mutability**: `view`
- **Signature hash**: `72b8de14`

Checks if time to challenge the outcome is over

#### Outputs

| type   | description               |
| ------ | ------------------------- |
| *bool* | Is challenge period over? |

### setForwardedOutcome()

- **State mutability**: `nonpayable`
- **Signature hash**: `739b8c48`

Allows to set oracle outcome

### getOutcome()

- **State mutability**: `view`
- **Signature hash**: `7e7e4b47`

Returns winning outcome

#### Outputs

| type     | description |
| -------- | ----------- |
| *int256* | Outcome     |

### isChallenged()

- **State mutability**: `view`
- **Signature hash**: `9df4d0fe`

Checks if outcome was challenged

#### Outputs

| type   | description    |
| ------ | -------------- |
| *bool* | Is challenged? |

### challengeOutcome(*int256* `_outcome`)

- **State mutability**: `nonpayable`
- **Signature hash**: `9f0de490`

Allows to challenge the oracle outcome

#### Inputs

| type     | name       | description       |
| -------- | ---------- | ----------------- |
| *int256* | `_outcome` | Outcome to bid on |

### isOutcomeSet()

- **State mutability**: `view`
- **Signature hash**: `ccdf68f3`

Returns if winning outcome is set

#### Outputs

| type   | description     |
| ------ | --------------- |
| *bool* | Is outcome set? |

### voteForOutcome(*int256* `_outcome`, *uint256* `amount`)

- **State mutability**: `nonpayable`
- **Signature hash**: `f7553098`

Allows to challenge the oracle outcome

#### Inputs

| type      | name       | description       |
| --------- | ---------- | ----------------- |
| *int256*  | `_outcome` | Outcome to bid on |
| *uint256* | `amount`   | Amount to bid     |

# UltimateOracleData

- **Constructor**: UltimateOracleData()
- This contract does **not** have a fallback function.

## UltimateOracleData Accessors

* *address* forwardedOracle() `061a85c7`
* *uint256* frontRunnerPeriod() `0853f7eb`
* *int256* frontRunner() `0f3e9438`
* *uint256* totalAmount() `1a39d8ef`
* *uint256* totalOutcomeAmounts(*int256*) `1ff14311`
* *uint256* forwardedOutcomeSetTimestamp() `466ae314`
* *uint256* frontRunnerSetTimestamp() `8ef8125e`
* *int256* forwardedOutcome() `984a470a`
* *uint256* challengeAmount() `9d89e7d4`
* *address* collateralToken() `b2016bd4`
* *uint256* outcomeAmounts(*address*, *int256*) `c427af9b`
* *uint8* spreadMultiplier() `d84d2a47`
* *uint256* challengePeriod() `f3f480d9`

## UltimateOracleData Events

### ForwardedOracleOutcomeAssignment(*int256* `outcome`)

**Signature hash**: `6eab3db94ac766c1ac203bcd9c9636476993422eaa067ad449e20ce8501b2a8f`

### OutcomeChallenge(*address* indexed `sender`, *int256* `outcome`)

**Signature hash**: `d0fdeb84e66d569a89718f40a99496b38d6c13249a9c9f623fbaa3d8ef343a9d`

### OutcomeVote(*address* indexed `sender`, *int256* `outcome`, *uint256* `amount`)

**Signature hash**: `86fa706979a07f1dd01a49718016881d95ada425549c353ec9e55a627b98a93b`

### Withdrawal(*address* indexed `sender`, *uint256* `amount`)

**Signature hash**: `7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65`

# UltimateOracleProxy

- **Constructor**: UltimateOracleProxy(*address* `proxied`, *address* `_forwardedOracle`, *address* `_collateralToken`, *uint8* `_spreadMultiplier`, *uint256* `_challengePeriod`, *uint256* `_challengeAmount`, *uint256* `_frontRunnerPeriod`)
- This contract has a `payable` fallback function.

## UltimateOracleProxy Accessors

* *address* forwardedOracle() `061a85c7`
* *uint256* frontRunnerPeriod() `0853f7eb`
* *int256* frontRunner() `0f3e9438`
* *uint256* totalAmount() `1a39d8ef`
* *uint256* totalOutcomeAmounts(*int256*) `1ff14311`
* *uint256* forwardedOutcomeSetTimestamp() `466ae314`
* *uint256* frontRunnerSetTimestamp() `8ef8125e`
* *int256* forwardedOutcome() `984a470a`
* *uint256* challengeAmount() `9d89e7d4`
* *address* masterCopy() `a619486e`
* *address* collateralToken() `b2016bd4`
* *uint256* outcomeAmounts(*address*, *int256*) `c427af9b`
* *uint8* spreadMultiplier() `d84d2a47`
* *uint256* challengePeriod() `f3f480d9`

## UltimateOracleProxy Events

### ForwardedOracleOutcomeAssignment(*int256* `outcome`)

**Signature hash**: `6eab3db94ac766c1ac203bcd9c9636476993422eaa067ad449e20ce8501b2a8f`

### OutcomeChallenge(*address* indexed `sender`, *int256* `outcome`)

**Signature hash**: `d0fdeb84e66d569a89718f40a99496b38d6c13249a9c9f623fbaa3d8ef343a9d`

### OutcomeVote(*address* indexed `sender`, *int256* `outcome`, *uint256* `amount`)

**Signature hash**: `86fa706979a07f1dd01a49718016881d95ada425549c353ec9e55a627b98a93b`

### Withdrawal(*address* indexed `sender`, *uint256* `amount`)

**Signature hash**: `7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65`
