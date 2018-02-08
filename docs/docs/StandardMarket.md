* [StandardMarket](#standardmarket)
  * [Accessors](#standardmarket-accessors)
  * [Events](#standardmarket-events)
    * [MarketFunding(*uint256* `funding`)](#marketfundinguint256-funding)
    * [MarketClosing()](#marketclosing)
    * [FeeWithdrawal(*uint256* `fees`)](#feewithdrawaluint256-fees)
    * [OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)](#outcometokentradeaddress-indexed-transactor-int256-outcometokenamounts-int256-outcometokennetcost-uint256-marketfees)
  * [Functions](#standardmarket-functions)
    * [trade(*int256[]* `outcomeTokenAmounts`, *int256* `collateralLimit`)](#tradeint256-outcometokenamounts-int256-collaterallimit)
    * [close()](#close)
    * [withdrawFees()](#withdrawfees)
    * [calcMarketFee(*uint256* `outcomeTokenCost`)](#calcmarketfeeuint256-outcometokencost)
    * [fund(*uint256* `_funding`)](#funduint256-_funding)
* [StandardMarketData](#standardmarketdata)
  * [Accessors](#standardmarketdata-accessors)
* [StandardMarketProxy](#standardmarketproxy)
  * [Accessors](#standardmarketproxy-accessors)
  * [Events](#standardmarketproxy-events)
    * [MarketFunding(*uint256* `funding`)](#marketfundinguint256-funding)
    * [MarketClosing()](#marketclosing)
    * [FeeWithdrawal(*uint256* `fees`)](#feewithdrawaluint256-fees)
    * [OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)](#outcometokentradeaddress-indexed-transactor-int256-outcometokenamounts-int256-outcometokennetcost-uint256-marketfees)

# StandardMarket

### Standard market contract - Backed implementation of standard markets

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: StandardMarket()
- This contract does **not** have a fallback function.

## StandardMarket Accessors

* *address* creator() `02d05d3f`
* *address* marketMaker() `1f21f9af`
* *uint256* createdAtBlock() `59acb42c`
* *int256* netOutcomeTokensSold(*uint256*) `a157979c`
* *address* masterCopy() `a619486e`
* *uint8* stage() `c040e6b8`
* *uint256* funding() `cb4c86b7`
* *uint24* fee() `ddca3f43`
* *address* eventContract() `e274fd24`
* *uint24* FEE_RANGE() `fbde47f6`

## StandardMarket Events

### MarketFunding(*uint256* `funding`)

**Signature hash**: `8a2fe22ce705a4ac9c189969cef327affbdc477afdae4ae274c2f8ad021f9163`

### MarketClosing()

**Signature hash**: `e7d85885f81486e8f4c99e50e056745493861b8b5d4f973dcf0c3c0f74a25e07`

### FeeWithdrawal(*uint256* `fees`)

**Signature hash**: `706d7f48c702007c2fb0881cea5759732e64f52faee427d5ab030787cfb7d787`

### OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)

**Signature hash**: `a66fcf59f5b6e4cb46e5745fd40c7dfac01b0a81b2b5e55038d9ec959adf7eaa`

## StandardMarket Functions

### trade(*int256[]* `outcomeTokenAmounts`, *int256* `collateralLimit`)

- **State mutability**: `nonpayable`
- **Signature hash**: `15bd7611`

Allows to trade outcome tokens and collateral with the market maker

#### Inputs

| type       | name                  | description                                                                                                                                                                                                                                                              |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| *int256[]* | `outcomeTokenAmounts` | Amounts of each outcome token to buy or sell. If positive, will buy this amount of outcome token from the market. If negative, will sell this amount back to the market instead.                                                                                         |
| *int256*   | `collateralLimit`     | If positive, this is the limit for the amount of collateral tokens which will be sent to the market to conduct the trade. If negative, this is the minimum amount of collateral tokens which will be received from the market for the trade. If zero, there is no limit. |

#### Outputs

| type     | name      | description                                                                                                                                                            |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *int256* | `netCost` | If positive, the amount of collateral sent to the market. If negative, the amount of collateral received from the market. If zero, no collateral was sent or received. |

### close()

- **State mutability**: `nonpayable`
- **Signature hash**: `43d726d6`

Allows market creator to close the markets by transferring all remaining outcome tokens to the creator

### withdrawFees()

- **State mutability**: `nonpayable`
- **Signature hash**: `476343ee`

Allows market creator to withdraw fees generated by trades

#### Outputs

| type      | name   | description |
| --------- | ------ | ----------- |
| *uint256* | `fees` | Fee amount  |

### calcMarketFee(*uint256* `outcomeTokenCost`)

- **State mutability**: `view`
- **Signature hash**: `b0011509`

Calculates fee to be paid to market maker

#### Inputs

| type      | name               | description                    |
| --------- | ------------------ | ------------------------------ |
| *uint256* | `outcomeTokenCost` | Cost for buying outcome tokens |

#### Outputs

| type      | description   |
| --------- | ------------- |
| *uint256* | Fee for trade |

### fund(*uint256* `_funding`)

- **State mutability**: `nonpayable`
- **Signature hash**: `ca1d209d`

Allows to fund the market with collateral tokens converting them into outcome tokens

#### Inputs

| type      | name       | description    |
| --------- | ---------- | -------------- |
| *uint256* | `_funding` | Funding amount |

# StandardMarketData

- **Constructor**: StandardMarketData()
- This contract does **not** have a fallback function.

## StandardMarketData Accessors

* *uint24* FEE_RANGE() `fbde47f6`

# StandardMarketProxy

- **Constructor**: StandardMarketProxy(*address* `proxy`, *address* `_creator`, *address* `_eventContract`, *address* `_marketMaker`, *uint24* `_fee`)
- This contract has a `payable` fallback function.

## StandardMarketProxy Accessors

* *address* creator() `02d05d3f`
* *address* marketMaker() `1f21f9af`
* *uint256* createdAtBlock() `59acb42c`
* *int256* netOutcomeTokensSold(*uint256*) `a157979c`
* *address* masterCopy() `a619486e`
* *uint8* stage() `c040e6b8`
* *uint256* funding() `cb4c86b7`
* *uint24* fee() `ddca3f43`
* *address* eventContract() `e274fd24`
* *uint24* FEE_RANGE() `fbde47f6`

## StandardMarketProxy Events

### MarketFunding(*uint256* `funding`)

**Signature hash**: `8a2fe22ce705a4ac9c189969cef327affbdc477afdae4ae274c2f8ad021f9163`

### MarketClosing()

**Signature hash**: `e7d85885f81486e8f4c99e50e056745493861b8b5d4f973dcf0c3c0f74a25e07`

### FeeWithdrawal(*uint256* `fees`)

**Signature hash**: `706d7f48c702007c2fb0881cea5759732e64f52faee427d5ab030787cfb7d787`

### OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)

**Signature hash**: `a66fcf59f5b6e4cb46e5745fd40c7dfac01b0a81b2b5e55038d9ec959adf7eaa`
