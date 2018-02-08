* [MarketMaker](#marketmaker)
  * [Functions](#marketmaker-functions)
    * [calcProfit(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)](#calcprofitaddress-market-uint8-outcometokenindex-uint256-outcometokencount)
    * [calcCost(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)](#calccostaddress-market-uint8-outcometokenindex-uint256-outcometokencount)
    * [calcMarginalPrice(*address* `market`, *uint8* `outcomeTokenIndex`)](#calcmarginalpriceaddress-market-uint8-outcometokenindex)

# MarketMaker

### Abstract market maker contract - Functions to be implemented by market maker contracts

- **Constructor**: MarketMaker()
- This contract does **not** have a fallback function.

## MarketMaker Functions

### calcProfit(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)

- **State mutability**: `view`
- **Signature hash**: `4091c6a9`

#### Inputs

| type      | name                |
| --------- | ------------------- |
| *address* | `market`            |
| *uint8*   | `outcomeTokenIndex` |
| *uint256* | `outcomeTokenCount` |

#### Outputs

| type      |
| --------- |
| *uint256* |

### calcCost(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)

- **State mutability**: `view`
- **Signature hash**: `bd8ff817`

#### Inputs

| type      | name                |
| --------- | ------------------- |
| *address* | `market`            |
| *uint8*   | `outcomeTokenIndex` |
| *uint256* | `outcomeTokenCount` |

#### Outputs

| type      |
| --------- |
| *uint256* |

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
