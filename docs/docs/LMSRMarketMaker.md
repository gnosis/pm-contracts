* [LMSRMarketMaker](#lmsrmarketmaker)
  * [Functions](#lmsrmarketmaker-functions)
    * [calcProfit(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)](#calcprofitaddress-market-uint8-outcometokenindex-uint256-outcometokencount)
    * [calcCost(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)](#calccostaddress-market-uint8-outcometokenindex-uint256-outcometokencount)
    * [calcMarginalPrice(*address* `market`, *uint8* `outcomeTokenIndex`)](#calcmarginalpriceaddress-market-uint8-outcometokenindex)

# LMSRMarketMaker

### LMSR market maker contract - Calculates share prices based on share distribution and initial funding

- **Author**: Alan Lu - <alan.lu@gnosis.pm>
- **Constructor**: LMSRMarketMaker()
- This contract does **not** have a fallback function.

## LMSRMarketMaker Functions

### calcProfit(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)

- **State mutability**: `view`
- **Signature hash**: `4091c6a9`

Returns profit for selling given number of outcome tokens

#### Inputs

| type      | name                | description                      |
| --------- | ------------------- | -------------------------------- |
| *address* | `market`            | Market contract                  |
| *uint8*   | `outcomeTokenIndex` | Index of outcome to sell         |
| *uint256* | `outcomeTokenCount` | Number of outcome tokens to sell |

#### Outputs

| type      | name     | description |
| --------- | -------- | ----------- |
| *uint256* | `profit` | Profit      |

### calcCost(*address* `market`, *uint8* `outcomeTokenIndex`, *uint256* `outcomeTokenCount`)

- **State mutability**: `view`
- **Signature hash**: `bd8ff817`

Returns cost to buy given number of outcome tokens

#### Inputs

| type      | name                | description                     |
| --------- | ------------------- | ------------------------------- |
| *address* | `market`            | Market contract                 |
| *uint8*   | `outcomeTokenIndex` | Index of outcome to buy         |
| *uint256* | `outcomeTokenCount` | Number of outcome tokens to buy |

#### Outputs

| type      | name   | description |
| --------- | ------ | ----------- |
| *uint256* | `cost` | Cost        |

### calcMarginalPrice(*address* `market`, *uint8* `outcomeTokenIndex`)

- **State mutability**: `view`
- **Signature hash**: `d812d346`

Returns marginal price of an outcome

#### Inputs

| type      | name                | description                                     |
| --------- | ------------------- | ----------------------------------------------- |
| *address* | `market`            | Market contract                                 |
| *uint8*   | `outcomeTokenIndex` | Index of outcome to determine marginal price of |

#### Outputs

| type      | name    | description                                          |
| --------- | ------- | ---------------------------------------------------- |
| *uint256* | `price` | Marginal price of an outcome as a fixed point number |
