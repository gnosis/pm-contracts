* [FutarchyOracleFactory](#futarchyoraclefactory)
  * [Accessors](#futarchyoraclefactory-accessors)
  * [Events](#futarchyoraclefactory-events)
    * [FutarchyOracleCreation(*address* indexed `creator`, *address* `futarchyOracle`, *address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`, *int256* `lowerBound`, *int256* `upperBound`, *address* `marketMaker`, *uint24* `fee`, *uint256* `tradingPeriod`, *uint256* `startDate`)](#futarchyoraclecreationaddress-indexed-creator-address-futarchyoracle-address-collateraltoken-address-oracle-uint8-outcomecount-int256-lowerbound-int256-upperbound-address-marketmaker-uint24-fee-uint256-tradingperiod-uint256-startdate)
  * [Functions](#futarchyoraclefactory-functions)
    * [createFutarchyOracle(*address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`, *int256* `lowerBound`, *int256* `upperBound`, *address* `marketMaker`, *uint24* `fee`, *uint256* `tradingPeriod`, *uint256* `startDate`)](#createfutarchyoracleaddress-collateraltoken-address-oracle-uint8-outcomecount-int256-lowerbound-int256-upperbound-address-marketmaker-uint24-fee-uint256-tradingperiod-uint256-startdate)

# FutarchyOracleFactory

### Futarchy oracle factory contract - Allows to create Futarchy oracle contracts

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: FutarchyOracleFactory(*address* `_futarchyOracleMasterCopy`, *address* `_eventFactory`, *address* `_marketFactory`)
- This contract does **not** have a fallback function.

## FutarchyOracleFactory Accessors

* *address* futarchyOracleMasterCopy() `1ad42df7`

## FutarchyOracleFactory Events

### FutarchyOracleCreation(*address* indexed `creator`, *address* `futarchyOracle`, *address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`, *int256* `lowerBound`, *int256* `upperBound`, *address* `marketMaker`, *uint24* `fee`, *uint256* `tradingPeriod`, *uint256* `startDate`)

**Signature hash**: `31b2f2efb8e38b0139781fb93941176394ceb31c7433234a12da403999ca8766`

## FutarchyOracleFactory Functions

### createFutarchyOracle(*address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`, *int256* `lowerBound`, *int256* `upperBound`, *address* `marketMaker`, *uint24* `fee`, *uint256* `tradingPeriod`, *uint256* `startDate`)

- **State mutability**: `nonpayable`
- **Signature hash**: `bb6de2bc`

Creates a new Futarchy oracle contract

#### Inputs

| type      | name              | description                                              |
| --------- | ----------------- | -------------------------------------------------------- |
| *address* | `collateralToken` | Tokens used as collateral in exchange for outcome tokens |
| *address* | `oracle`          | Oracle contract used to resolve the event                |
| *uint8*   | `outcomeCount`    | Number of event outcomes                                 |
| *int256*  | `lowerBound`      | Lower bound for event outcome                            |
| *int256*  | `upperBound`      | Lower bound for event outcome                            |
| *address* | `marketMaker`     | Market maker contract                                    |
| *uint24*  | `fee`             | Market fee                                               |
| *uint256* | `tradingPeriod`   | Trading period before decision can be determined         |
| *uint256* | `startDate`       | Start date for price logging                             |

#### Outputs

| type      | name             | description     |
| --------- | ---------------- | --------------- |
| *address* | `futarchyOracle` | Oracle contract |
