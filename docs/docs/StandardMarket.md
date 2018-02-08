* [StandardMarket](#standardmarket)
  * [Accessors](#standardmarket-accessors)
  * [Events](#standardmarket-events)
    * [MarketFunding(*uint256* `funding`)](#marketfundinguint256-funding)
    * [MarketClosing()](#marketclosing)
    * [FeeWithdrawal(*uint256* `fees`)](#feewithdrawaluint256-fees)
    * [OutcomeTokenPurchase(*address* indexed `buyer`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `outcomeTokenCost`, *uint256* `marketFees`)](#outcometokenpurchaseaddress-indexed-buyer-uint8-outcometokenindex-uint256-outcometokencount-uint256-outcometokencost-uint256-marketfees)
    * [OutcomeTokenSale(*address* indexed `seller`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `outcomeTokenProfit`, *uint256* `marketFees`)](#outcometokensaleaddress-indexed-seller-uint8-outcometokenindex-uint256-outcometokencount-uint256-outcometokenprofit-uint256-marketfees)
    * [OutcomeTokenShortSale(*address* indexed `buyer`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `cost`)](#outcometokenshortsaleaddress-indexed-buyer-uint8-outcometokenindex-uint256-outcometokencount-uint256-cost)
  * [Functions](#standardmarket-functions)
    * [shortSell(*uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `minProfit`)](#shortselluint8-outcometokenindex-uint256-outcometokencount-uint256-minprofit)
    * [close()](#close)
    * [sell(*uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `minProfit`)](#selluint8-outcometokenindex-uint256-outcometokencount-uint256-minprofit)
    * [withdrawFees()](#withdrawfees)
    * [calcMarketFee(*uint256* `outcomeTokenCost`)](#calcmarketfeeuint256-outcometokencost)
    * [fund(*uint256* `_funding`)](#funduint256-_funding)
    * [buy(*uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `maxCost`)](#buyuint8-outcometokenindex-uint256-outcometokencount-uint256-maxcost)

# StandardMarket

### Market factory contract - Allows to create market contracts

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: StandardMarket(*address* `_creator`, *address* `_eventContract`, *address* `_marketMaker`, *uint24* `_fee`)
- This contract does **not** have a fallback function.

## StandardMarket Accessors

* *address* creator() `02d05d3f`
* *address* marketMaker() `1f21f9af`
* *uint256* createdAtBlock() `59acb42c`
* *int256* netOutcomeTokensSold(*uint256*) `a157979c`
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

### OutcomeTokenPurchase(*address* indexed `buyer`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `outcomeTokenCost`, *uint256* `marketFees`)

**Signature hash**: `7caea4a19892ce49b4daa2014d5599eed561dcd16ffabfac851a9737217ae410`

### OutcomeTokenSale(*address* indexed `seller`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `outcomeTokenProfit`, *uint256* `marketFees`)

**Signature hash**: `ab24ef3371efb2e0e3b02955e33b8ef03c14523e71f3bda87878a2386cc17b69`

### OutcomeTokenShortSale(*address* indexed `buyer`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `cost`)

**Signature hash**: `1dbdc4ff4d51949738d56e120b2be4edecc55d8d2150f1616ec5802abaae3f88`

## StandardMarket Functions

### shortSell(*uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `minProfit`)

- **State mutability**: `nonpayable`
- **Signature hash**: `28c05d32`

Buys all outcomes, then sells all shares of selected outcome which were bought, keeping      shares of all other outcome tokens.

#### Inputs

| type      | name                | description                                                                   |
| --------- | ------------------- | ----------------------------------------------------------------------------- |
| *uint8*   | `outcomeTokenIndex` | Index of the outcome token to short sell                                      |
| *uint256* | `outcomeTokenCount` | Amount of outcome tokens to short sell                                        |
| *uint256* | `minProfit`         | The minimum profit in collateral tokens to earn for short sold outcome tokens |

#### Outputs

| type      | name   | description                                     |
| --------- | ------ | ----------------------------------------------- |
| *uint256* | `cost` | Cost to short sell outcome in collateral tokens |

### close()

- **State mutability**: `nonpayable`
- **Signature hash**: `43d726d6`

Allows market creator to close the markets by transferring all remaining outcome tokens to the creator

### sell(*uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `minProfit`)

- **State mutability**: `nonpayable`
- **Signature hash**: `46280a80`

Allows to sell outcome tokens to market maker

#### Inputs

| type      | name                | description                                                        |
| --------- | ------------------- | ------------------------------------------------------------------ |
| *uint8*   | `outcomeTokenIndex` | Index of the outcome token to sell                                 |
| *uint256* | `outcomeTokenCount` | Amount of outcome tokens to sell                                   |
| *uint256* | `minProfit`         | The minimum profit in collateral tokens to earn for outcome tokens |

#### Outputs

| type      | name     | description                 |
| --------- | -------- | --------------------------- |
| *uint256* | `profit` | Profit in collateral tokens |

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

### buy(*uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`, *uint256* `maxCost`)

- **State mutability**: `nonpayable`
- **Signature hash**: `f6d956df`

Allows to buy outcome tokens from market maker

#### Inputs

| type      | name                | description                                                     |
| --------- | ------------------- | --------------------------------------------------------------- |
| *uint8*   | `outcomeTokenIndex` | Index of the outcome token to buy                               |
| *uint256* | `outcomeTokenCount` | Amount of outcome tokens to buy                                 |
| *uint256* | `maxCost`           | The maximum cost in collateral tokens to pay for outcome tokens |

#### Outputs

| type      | name   | description               |
| --------- | ------ | ------------------------- |
| *uint256* | `cost` | Cost in collateral tokens |
