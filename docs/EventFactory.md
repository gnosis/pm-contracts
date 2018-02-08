* [EventFactory](#eventfactory)
  * [Accessors](#eventfactory-accessors)
  * [Events](#eventfactory-events)
    * [CategoricalEventCreation(*address* indexed `creator`, *address* `categoricalEvent`, *address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`)](#categoricaleventcreationaddress-indexed-creator-address-categoricalevent-address-collateraltoken-address-oracle-uint8-outcomecount)
    * [ScalarEventCreation(*address* indexed `creator`, *address* `scalarEvent`, *address* `collateralToken`, *address* `oracle`, *int256* `lowerBound`, *int256* `upperBound`)](#scalareventcreationaddress-indexed-creator-address-scalarevent-address-collateraltoken-address-oracle-int256-lowerbound-int256-upperbound)
  * [Functions](#eventfactory-functions)
    * [createScalarEvent(*address* `collateralToken`, *address* `oracle`, *int256* `lowerBound`, *int256* `upperBound`)](#createscalareventaddress-collateraltoken-address-oracle-int256-lowerbound-int256-upperbound)
    * [createCategoricalEvent(*address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`)](#createcategoricaleventaddress-collateraltoken-address-oracle-uint8-outcomecount)

# EventFactory

### Event factory contract - Allows creation of categorical and scalar events

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: EventFactory()
- This contract does **not** have a fallback function.

## EventFactory Accessors

* *address* categoricalEvents(*bytes32*) `8d1d2c21`
* *address* scalarEvents(*bytes32*) `9897e8a5`

## EventFactory Events

### CategoricalEventCreation(*address* indexed `creator`, *address* `categoricalEvent`, *address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`)

**Signature hash**: `9732758aee476f5125b50d29cc43e28422f12ec078ba9f5c712f9dbd52796f59`

### ScalarEventCreation(*address* indexed `creator`, *address* `scalarEvent`, *address* `collateralToken`, *address* `oracle`, *int256* `lowerBound`, *int256* `upperBound`)

**Signature hash**: `d613e63983a1538814e1b390fc232d0e20462cf7410924f6b6a5f29ea38e82ed`

## EventFactory Functions

### createScalarEvent(*address* `collateralToken`, *address* `oracle`, *int256* `lowerBound`, *int256* `upperBound`)

- **State mutability**: `nonpayable`
- **Signature hash**: `5ea194a3`

Creates a new scalar event and adds it to the event mapping

#### Inputs

| type      | name              | description                                              |
| --------- | ----------------- | -------------------------------------------------------- |
| *address* | `collateralToken` | Tokens used as collateral in exchange for outcome tokens |
| *address* | `oracle`          | Oracle contract used to resolve the event                |
| *int256*  | `lowerBound`      | Lower bound for event outcome                            |
| *int256*  | `upperBound`      | Lower bound for event outcome                            |

#### Outputs

| type      | name            | description    |
| --------- | --------------- | -------------- |
| *address* | `eventContract` | Event contract |

### createCategoricalEvent(*address* `collateralToken`, *address* `oracle`, *uint8* `outcomeCount`)

- **State mutability**: `nonpayable`
- **Signature hash**: `9df0c176`

Creates a new categorical event and adds it to the event mapping

#### Inputs

| type      | name              | description                                              |
| --------- | ----------------- | -------------------------------------------------------- |
| *address* | `collateralToken` | Tokens used as collateral in exchange for outcome tokens |
| *address* | `oracle`          | Oracle contract used to resolve the event                |
| *uint8*   | `outcomeCount`    | Number of event outcomes                                 |

#### Outputs

| type      | name            | description    |
| --------- | --------------- | -------------- |
| *address* | `eventContract` | Event contract |
