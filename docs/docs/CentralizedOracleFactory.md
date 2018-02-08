* [CentralizedOracleFactory](#centralizedoraclefactory)
  * [Accessors](#centralizedoraclefactory-accessors)
  * [Events](#centralizedoraclefactory-events)
    * [CentralizedOracleCreation(*address* indexed `creator`, *address* `centralizedOracle`, *bytes* `ipfsHash`)](#centralizedoraclecreationaddress-indexed-creator-address-centralizedoracle-bytes-ipfshash)
  * [Functions](#centralizedoraclefactory-functions)
    * [createCentralizedOracle(*bytes* `ipfsHash`)](#createcentralizedoraclebytes-ipfshash)

# CentralizedOracleFactory

### Centralized oracle factory contract - Allows to create centralized oracle contracts

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: CentralizedOracleFactory(*address* `_centralizedOracleMasterCopy`)
- This contract does **not** have a fallback function.

## CentralizedOracleFactory Accessors

* *address* centralizedOracleMasterCopy() `af09ff55`

## CentralizedOracleFactory Events

### CentralizedOracleCreation(*address* indexed `creator`, *address* `centralizedOracle`, *bytes* `ipfsHash`)

**Signature hash**: `33a1926cf5c2f7306ac1685bf19260d678fea874f5f59c00b69fa5e2643ecfd2`

## CentralizedOracleFactory Functions

### createCentralizedOracle(*bytes* `ipfsHash`)

- **State mutability**: `nonpayable`
- **Signature hash**: `4e2f220c`

Creates a new centralized oracle contract

#### Inputs

| type    | name       | description                                  |
| ------- | ---------- | -------------------------------------------- |
| *bytes* | `ipfsHash` | Hash identifying off chain event description |

#### Outputs

| type      | name                | description     |
| --------- | ------------------- | --------------- |
| *address* | `centralizedOracle` | Oracle contract |
