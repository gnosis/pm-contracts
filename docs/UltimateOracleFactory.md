* [UltimateOracleFactory](#ultimateoraclefactory)
  * [Accessors](#ultimateoraclefactory-accessors)
  * [Events](#ultimateoraclefactory-events)
    * [UltimateOracleCreation(*address* indexed `creator`, *address* `ultimateOracle`, *address* `oracle`, *address* `collateralToken`, *uint8* `spreadMultiplier`, *uint256* `challengePeriod`, *uint256* `challengeAmount`, *uint256* `frontRunnerPeriod`)](#ultimateoraclecreationaddress-indexed-creator-address-ultimateoracle-address-oracle-address-collateraltoken-uint8-spreadmultiplier-uint256-challengeperiod-uint256-challengeamount-uint256-frontrunnerperiod)
  * [Functions](#ultimateoraclefactory-functions)
    * [createUltimateOracle(*address* `oracle`, *address* `collateralToken`, *uint8* `spreadMultiplier`, *uint256* `challengePeriod`, *uint256* `challengeAmount`, *uint256* `frontRunnerPeriod`)](#createultimateoracleaddress-oracle-address-collateraltoken-uint8-spreadmultiplier-uint256-challengeperiod-uint256-challengeamount-uint256-frontrunnerperiod)

# UltimateOracleFactory

### Ultimate oracle factory contract - Allows to create ultimate oracle contracts

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: UltimateOracleFactory(*address* `_ultimateOracleMasterCopy`)
- This contract does **not** have a fallback function.

## UltimateOracleFactory Accessors

* *address* ultimateOracleMasterCopy() `2d1dc849`

## UltimateOracleFactory Events

### UltimateOracleCreation(*address* indexed `creator`, *address* `ultimateOracle`, *address* `oracle`, *address* `collateralToken`, *uint8* `spreadMultiplier`, *uint256* `challengePeriod`, *uint256* `challengeAmount`, *uint256* `frontRunnerPeriod`)

**Signature hash**: `e6ae2b8211e9721c5dae1d93f70be0ba07bd111608ba4db4317742e1a87fff40`

## UltimateOracleFactory Functions

### createUltimateOracle(*address* `oracle`, *address* `collateralToken`, *uint8* `spreadMultiplier`, *uint256* `challengePeriod`, *uint256* `challengeAmount`, *uint256* `frontRunnerPeriod`)

- **State mutability**: `nonpayable`
- **Signature hash**: `ce70faec`

Creates a new ultimate Oracle contract

#### Inputs

| type      | name                | description                                                         |
| --------- | ------------------- | ------------------------------------------------------------------- |
| *address* | `oracle`            | Oracle address                                                      |
| *address* | `collateralToken`   | Collateral token address                                            |
| *uint8*   | `spreadMultiplier`  | Defines the spread as a multiple of the money bet on other outcomes |
| *uint256* | `challengePeriod`   | Time to challenge oracle outcome                                    |
| *uint256* | `challengeAmount`   | Amount to challenge the outcome                                     |
| *uint256* | `frontRunnerPeriod` | Time to overbid the front-runner                                    |

#### Outputs

| type      | name             | description     |
| --------- | ---------------- | --------------- |
| *address* | `ultimateOracle` | Oracle contract |
