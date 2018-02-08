* [StandardMarketFactory](#standardmarketfactory)
  * [Accessors](#standardmarketfactory-accessors)
  * [Events](#standardmarketfactory-events)
    * [StandardMarketCreation(*address* indexed `creator`, *address* `market`, *address* `eventContract`, *address* `marketMaker`, *uint24* `fee`)](#standardmarketcreationaddress-indexed-creator-address-market-address-eventcontract-address-marketmaker-uint24-fee)
  * [Functions](#standardmarketfactory-functions)
    * [createMarket(*address* `eventContract`, *address* `marketMaker`, *uint24* `fee`)](#createmarketaddress-eventcontract-address-marketmaker-uint24-fee)

# StandardMarketFactory

### Market factory contract - Allows to create market contracts

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: StandardMarketFactory(*address* `_standardMarketMasterCopy`)
- This contract does **not** have a fallback function.

## StandardMarketFactory Accessors

* *address* standardMarketMasterCopy() `5f78e700`

## StandardMarketFactory Events

### StandardMarketCreation(*address* indexed `creator`, *address* `market`, *address* `eventContract`, *address* `marketMaker`, *uint24* `fee`)

**Signature hash**: `a88e14227921dd3cab0fe30e6e4e4f8d646d8968abd25634fe49781588a8cf94`

## StandardMarketFactory Functions

### createMarket(*address* `eventContract`, *address* `marketMaker`, *uint24* `fee`)

- **State mutability**: `nonpayable`
- **Signature hash**: `7abeb6a0`

Creates a new market contract

#### Inputs

| type      | name            | description           |
| --------- | --------------- | --------------------- |
| *address* | `eventContract` | Event contract        |
| *address* | `marketMaker`   | Market maker contract |
| *uint24*  | `fee`           | Market fee            |

#### Outputs

| type      | name     | description     |
| --------- | -------- | --------------- |
| *address* | `market` | Market contract |
