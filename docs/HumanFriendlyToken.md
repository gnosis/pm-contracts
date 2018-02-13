* [HumanFriendlyToken](#humanfriendlytoken)
  * [Accessors](#humanfriendlytoken-accessors)
  * [Events](#humanfriendlytoken-events)
    * [Transfer(*address* indexed `from`, *address* indexed `to`, *uint256* `value`)](#transferaddress-indexed-from-address-indexed-to-uint256-value)
    * [Approval(*address* indexed `owner`, *address* indexed `spender`, *uint256* `value`)](#approvaladdress-indexed-owner-address-indexed-spender-uint256-value)
  * [Functions](#humanfriendlytoken-functions)
    * [approve(*address* `spender`, *uint256* `value`)](#approveaddress-spender-uint256-value)
    * [transferFrom(*address* `from`, *address* `to`, *uint256* `value`)](#transferfromaddress-from-address-to-uint256-value)
    * [balanceOf(*address* `owner`)](#balanceofaddress-owner)
    * [transfer(*address* `to`, *uint256* `value`)](#transferaddress-to-uint256-value)
    * [allowance(*address* `owner`, *address* `spender`)](#allowanceaddress-owner-address-spender)

# HumanFriendlyToken

### Abstract human-friendly token contract - Functions to be implemented by token contracts

- **Constructor**: HumanFriendlyToken()
- This contract does **not** have a fallback function.

## HumanFriendlyToken Accessors

* *string* name() `06fdde03`
* *uint256* totalSupply() `18160ddd`
* *uint8* decimals() `313ce567`
* *string* symbol() `95d89b41`

## HumanFriendlyToken Events

### Transfer(*address* indexed `from`, *address* indexed `to`, *uint256* `value`)

**Signature hash**: `ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`

### Approval(*address* indexed `owner`, *address* indexed `spender`, *uint256* `value`)

**Signature hash**: `8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925`

## HumanFriendlyToken Functions

### approve(*address* `spender`, *uint256* `value`)

- **State mutability**: `nonpayable`
- **Signature hash**: `095ea7b3`

#### Inputs

| type      | name      |
| --------- | --------- |
| *address* | `spender` |
| *uint256* | `value`   |

#### Outputs

| type   |
| ------ |
| *bool* |

### transferFrom(*address* `from`, *address* `to`, *uint256* `value`)

- **State mutability**: `nonpayable`
- **Signature hash**: `23b872dd`

#### Inputs

| type      | name    |
| --------- | ------- |
| *address* | `from`  |
| *address* | `to`    |
| *uint256* | `value` |

#### Outputs

| type   |
| ------ |
| *bool* |

### balanceOf(*address* `owner`)

- **State mutability**: `view`
- **Signature hash**: `70a08231`

#### Inputs

| type      | name    |
| --------- | ------- |
| *address* | `owner` |

#### Outputs

| type      |
| --------- |
| *uint256* |

### transfer(*address* `to`, *uint256* `value`)

- **State mutability**: `nonpayable`
- **Signature hash**: `a9059cbb`

#### Inputs

| type      | name    |
| --------- | ------- |
| *address* | `to`    |
| *uint256* | `value` |

#### Outputs

| type   |
| ------ |
| *bool* |

### allowance(*address* `owner`, *address* `spender`)

- **State mutability**: `view`
- **Signature hash**: `dd62ed3e`

#### Inputs

| type      | name      |
| --------- | --------- |
| *address* | `owner`   |
| *address* | `spender` |

#### Outputs

| type      |
| --------- |
| *uint256* |
