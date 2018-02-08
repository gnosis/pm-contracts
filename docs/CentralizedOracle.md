* [CentralizedOracle](#centralizedoracle)
  * [Accessors](#centralizedoracle-accessors)
  * [Events](#centralizedoracle-events)
    * [OwnerReplacement(*address* indexed `newOwner`)](#ownerreplacementaddress-indexed-newowner)
    * [OutcomeAssignment(*int256* `outcome`)](#outcomeassignmentint256-outcome)
  * [Functions](#centralizedoracle-functions)
    * [setOutcome(*int256* `_outcome`)](#setoutcomeint256-_outcome)
    * [getOutcome()](#getoutcome)
    * [replaceOwner(*address* `newOwner`)](#replaceowneraddress-newowner)
    * [isOutcomeSet()](#isoutcomeset)
* [CentralizedOracleData](#centralizedoracledata)
  * [Accessors](#centralizedoracledata-accessors)
  * [Events](#centralizedoracledata-events)
    * [OwnerReplacement(*address* indexed `newOwner`)](#ownerreplacementaddress-indexed-newowner)
    * [OutcomeAssignment(*int256* `outcome`)](#outcomeassignmentint256-outcome)
* [CentralizedOracleProxy](#centralizedoracleproxy)
  * [Accessors](#centralizedoracleproxy-accessors)
  * [Events](#centralizedoracleproxy-events)
    * [OwnerReplacement(*address* indexed `newOwner`)](#ownerreplacementaddress-indexed-newowner)
    * [OutcomeAssignment(*int256* `outcome`)](#outcomeassignmentint256-outcome)

# CentralizedOracle

### Centralized oracle contract - Allows the contract owner to set an outcome

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: CentralizedOracle()
- This contract does **not** have a fallback function.

## CentralizedOracle Accessors

* *int256* outcome() `27793f87`
* *address* owner() `8da5cb5b`
* *address* masterCopy() `a619486e`
* *bytes* ipfsHash() `c623674f`
* *bool* isSet() `c65fb380`

## CentralizedOracle Events

### OwnerReplacement(*address* indexed `newOwner`)

**Signature hash**: `191a2405c52452c381a62f3b7480f9d3e77a76d7737659fc1030aff54b395dd5`

### OutcomeAssignment(*int256* `outcome`)

**Signature hash**: `b1aaa9f4484acc283375c8e495a44766e4026170797dc9280b4ae2ab5632fb71`

## CentralizedOracle Functions

### setOutcome(*int256* `_outcome`)

- **State mutability**: `nonpayable`
- **Signature hash**: `717a195a`

Sets event outcome

#### Inputs

| type     | name       | description   |
| -------- | ---------- | ------------- |
| *int256* | `_outcome` | Event outcome |

### getOutcome()

- **State mutability**: `view`
- **Signature hash**: `7e7e4b47`

Returns outcome

#### Outputs

| type     | description |
| -------- | ----------- |
| *int256* | Outcome     |

### replaceOwner(*address* `newOwner`)

- **State mutability**: `nonpayable`
- **Signature hash**: `a39a45b7`

Replaces owner

#### Inputs

| type      | name       | description |
| --------- | ---------- | ----------- |
| *address* | `newOwner` | New owner   |

### isOutcomeSet()

- **State mutability**: `view`
- **Signature hash**: `ccdf68f3`

Returns if winning outcome is set

#### Outputs

| type   | description     |
| ------ | --------------- |
| *bool* | Is outcome set? |

# CentralizedOracleData

- **Constructor**: CentralizedOracleData()
- This contract does **not** have a fallback function.

## CentralizedOracleData Accessors

* *int256* outcome() `27793f87`
* *address* owner() `8da5cb5b`
* *bytes* ipfsHash() `c623674f`
* *bool* isSet() `c65fb380`

## CentralizedOracleData Events

### OwnerReplacement(*address* indexed `newOwner`)

**Signature hash**: `191a2405c52452c381a62f3b7480f9d3e77a76d7737659fc1030aff54b395dd5`

### OutcomeAssignment(*int256* `outcome`)

**Signature hash**: `b1aaa9f4484acc283375c8e495a44766e4026170797dc9280b4ae2ab5632fb71`

# CentralizedOracleProxy

- **Constructor**: CentralizedOracleProxy(*address* `proxied`, *address* `_owner`, *bytes* `_ipfsHash`)
- This contract has a `payable` fallback function.

## CentralizedOracleProxy Accessors

* *int256* outcome() `27793f87`
* *address* owner() `8da5cb5b`
* *address* masterCopy() `a619486e`
* *bytes* ipfsHash() `c623674f`
* *bool* isSet() `c65fb380`

## CentralizedOracleProxy Events

### OwnerReplacement(*address* indexed `newOwner`)

**Signature hash**: `191a2405c52452c381a62f3b7480f9d3e77a76d7737659fc1030aff54b395dd5`

### OutcomeAssignment(*int256* `outcome`)

**Signature hash**: `b1aaa9f4484acc283375c8e495a44766e4026170797dc9280b4ae2ab5632fb71`
