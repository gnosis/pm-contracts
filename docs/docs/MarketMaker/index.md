* [MarketMaker](#marketmaker)
  * [Functions](#marketmaker-functions)
    * [calcNetCost(*address* `market`, *int256[]* `outcomeTokenAmounts`)](#calcnetcostaddress-market-int256-outcometokenamounts)
    * [calcMarginalPrice(*address* `market`, *uint8* `outcomeTokenIndex`)](#calcmarginalpriceaddress-market-uint8-outcometokenindex)

# MarketMaker

### Abstract market maker contract - Functions to be implemented by market maker contracts

- **Constructor**: MarketMaker()
- This contract does **not** have a fallback function.

## MarketMaker Functions

### calcNetCost(*address* `market`, *int256[]* `outcomeTokenAmounts`)

- **State mutability**: `view`
- **Signature hash**: `38bf0452`

#### Inputs

| type       | name                  |
| ---------- | --------------------- |
| *address*  | `market`              |
| *int256[]* | `outcomeTokenAmounts` |

#### Outputs

| type     |
| -------- |
| *int256* |

### calcMarginalPrice(*address* `market`, *uint8* `outcomeTokenIndex`)

- **State mutability**: `view`
- **Signature hash**: `d812d346`

#### Inputs

| type      | name                |
| --------- | ------------------- |
| *address* | `market`            |
| *uint8*   | `outcomeTokenIndex` |

#### Outputs

| type      |
| --------- |
| *uint256* |
