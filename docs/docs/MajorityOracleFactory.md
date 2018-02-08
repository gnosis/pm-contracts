* [MajorityOracleFactory](#majorityoraclefactory)
  * [Accessors](#majorityoraclefactory-accessors)
  * [Events](#majorityoraclefactory-events)
    * [MajorityOracleCreation(*address* indexed `creator`, *address* `majorityOracle`, *address[]* `oracles`)](#majorityoraclecreationaddress-indexed-creator-address-majorityoracle-address-oracles)
  * [Functions](#majorityoraclefactory-functions)
    * [createMajorityOracle(*address[]* `oracles`)](#createmajorityoracleaddress-oracles)

# MajorityOracleFactory

### Majority oracle factory contract - Allows to create majority oracle contracts

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: MajorityOracleFactory(*address* `_majorityOracleMasterCopy`)
- This contract does **not** have a fallback function.

## MajorityOracleFactory Accessors

* *address* majorityOracleMasterCopy() `a41d7eec`

## MajorityOracleFactory Events

### MajorityOracleCreation(*address* indexed `creator`, *address* `majorityOracle`, *address[]* `oracles`)

**Signature hash**: `df1eeefc4815bdd1bdf45905c4ce59f6ca50efb4148303c9bbda2bff40301d3d`

## MajorityOracleFactory Functions

### createMajorityOracle(*address[]* `oracles`)

- **State mutability**: `nonpayable`
- **Signature hash**: `e04c0c52`

Creates a new majority oracle contract

#### Inputs

| type        | name      | description                                      |
| ----------- | --------- | ------------------------------------------------ |
| *address[]* | `oracles` | List of oracles taking part in the majority vote |

#### Outputs

| type      | name             | description     |
| --------- | ---------------- | --------------- |
| *address* | `majorityOracle` | Oracle contract |
