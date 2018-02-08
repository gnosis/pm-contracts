* [LMSRMarketMaker](#lmsrmarketmaker)
  * [Functions](#lmsrmarketmaker-functions)
    * [calcNetCost(*address* `market`, *int256[]* `outcomeTokenAmounts`)](#calcnetcostaddress-market-int256-outcometokenamounts)
    * [calcMarginalPrice(*address* `market`, *uint8* `outcomeTokenIndex`)](#calcmarginalpriceaddress-market-uint8-outcometokenindex)

# LMSRMarketMaker

### LMSR market maker contract - Calculates share prices based on share distribution and initial funding

- **Author**: Alan Lu - <alan.lu@gnosis.pm>
- **Constructor**: LMSRMarketMaker()
- This contract does **not** have a fallback function.

## LMSRMarketMaker Functions

### calcNetCost(*address* `market`, *int256[]* `outcomeTokenAmounts`)

- **State mutability**: `view`
- **Signature hash**: `38bf0452`

Calculates the net cost for executing a given trade.

#### Inputs

| type       | name                  | description                                                                                                             |
| ---------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| *address*  | `market`              | Market contract                                                                                                         |
| *int256[]* | `outcomeTokenAmounts` | Amounts of outcome tokens to buy from the market. If an amount is negative, represents an amount to sell to the market. |

#### Outputs

| type     | name      | description                                                                                                                                                                                                          |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *int256* | `netCost` | Net cost of trade. If positive, represents amount of collateral which would be paid to the market for the trade. If negative, represents amount of collateral which would be received from the market for the trade. |

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
