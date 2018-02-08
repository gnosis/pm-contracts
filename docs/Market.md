* [Market](#market)
  * [Accessors](#market-accessors)
  * [Events](#market-events)
    * [MarketFunding(*uint256* `funding`)](#marketfundinguint256-funding)
    * [MarketClosing()](#marketclosing)
    * [FeeWithdrawal(*uint256* `fees`)](#feewithdrawaluint256-fees)
    * [OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)](#outcometokentradeaddress-indexed-transactor-int256-outcometokenamounts-int256-outcometokennetcost-uint256-marketfees)
  * [Functions](#market-functions)
    * [trade(*int256[]* `outcomeTokenAmounts`, *int256* `costLimit`)](#tradeint256-outcometokenamounts-int256-costlimit)
    * [close()](#close)
    * [withdrawFees()](#withdrawfees)
    * [calcMarketFee(*uint256* `outcomeTokenCost`)](#calcmarketfeeuint256-outcometokencost)
    * [fund(*uint256* `_funding`)](#funduint256-_funding)
* [MarketData](#marketdata)
  * [Accessors](#marketdata-accessors)
  * [Events](#marketdata-events)
    * [MarketFunding(*uint256* `funding`)](#marketfundinguint256-funding)
    * [MarketClosing()](#marketclosing)
    * [FeeWithdrawal(*uint256* `fees`)](#feewithdrawaluint256-fees)
    * [OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)](#outcometokentradeaddress-indexed-transactor-int256-outcometokenamounts-int256-outcometokennetcost-uint256-marketfees)

# Market

### Abstract market contract - Functions to be implemented by market contracts

- **Constructor**: Market()
- This contract does **not** have a fallback function.

## Market Accessors

* *address* creator() `02d05d3f`
* *address* marketMaker() `1f21f9af`
* *uint256* createdAtBlock() `59acb42c`
* *int256* netOutcomeTokensSold(*uint256*) `a157979c`
* *uint8* stage() `c040e6b8`
* *uint256* funding() `cb4c86b7`
* *uint24* fee() `ddca3f43`
* *address* eventContract() `e274fd24`

## Market Events

### MarketFunding(*uint256* `funding`)

**Signature hash**: `8a2fe22ce705a4ac9c189969cef327affbdc477afdae4ae274c2f8ad021f9163`

### MarketClosing()

**Signature hash**: `e7d85885f81486e8f4c99e50e056745493861b8b5d4f973dcf0c3c0f74a25e07`

### FeeWithdrawal(*uint256* `fees`)

**Signature hash**: `706d7f48c702007c2fb0881cea5759732e64f52faee427d5ab030787cfb7d787`

### OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)

**Signature hash**: `a66fcf59f5b6e4cb46e5745fd40c7dfac01b0a81b2b5e55038d9ec959adf7eaa`

## Market Functions

### trade(*int256[]* `outcomeTokenAmounts`, *int256* `costLimit`)

- **State mutability**: `nonpayable`
- **Signature hash**: `15bd7611`

#### Inputs

| type       | name                  |
| ---------- | --------------------- |
| *int256[]* | `outcomeTokenAmounts` |
| *int256*   | `costLimit`           |

#### Outputs

| type     |
| -------- |
| *int256* |

### close()

- **State mutability**: `nonpayable`
- **Signature hash**: `43d726d6`

### withdrawFees()

- **State mutability**: `nonpayable`
- **Signature hash**: `476343ee`

#### Outputs

| type      |
| --------- |
| *uint256* |

### calcMarketFee(*uint256* `outcomeTokenCost`)

- **State mutability**: `view`
- **Signature hash**: `b0011509`

#### Inputs

| type      | name               |
| --------- | ------------------ |
| *uint256* | `outcomeTokenCost` |

#### Outputs

| type      |
| --------- |
| *uint256* |

### fund(*uint256* `_funding`)

- **State mutability**: `nonpayable`
- **Signature hash**: `ca1d209d`

#### Inputs

| type      | name       |
| --------- | ---------- |
| *uint256* | `_funding` |

# MarketData

- **Constructor**: MarketData()
- This contract does **not** have a fallback function.

## MarketData Accessors

* *address* creator() `02d05d3f`
* *address* marketMaker() `1f21f9af`
* *uint256* createdAtBlock() `59acb42c`
* *int256* netOutcomeTokensSold(*uint256*) `a157979c`
* *uint8* stage() `c040e6b8`
* *uint256* funding() `cb4c86b7`
* *uint24* fee() `ddca3f43`
* *address* eventContract() `e274fd24`

## MarketData Events

### MarketFunding(*uint256* `funding`)

**Signature hash**: `8a2fe22ce705a4ac9c189969cef327affbdc477afdae4ae274c2f8ad021f9163`

### MarketClosing()

**Signature hash**: `e7d85885f81486e8f4c99e50e056745493861b8b5d4f973dcf0c3c0f74a25e07`

### FeeWithdrawal(*uint256* `fees`)

**Signature hash**: `706d7f48c702007c2fb0881cea5759732e64f52faee427d5ab030787cfb7d787`

### OutcomeTokenTrade(*address* indexed `transactor`, *int256[]* `outcomeTokenAmounts`, *int256* `outcomeTokenNetCost`, *uint256* `marketFees`)

**Signature hash**: `a66fcf59f5b6e4cb46e5745fd40c7dfac01b0a81b2b5e55038d9ec959adf7eaa`
