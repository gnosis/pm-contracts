* [Math](#math)
  * [Accessors](#math-accessors)
  * [Functions](#math-functions)
    * [safeToMul(*int256* `a`, *int256* `b`)](#safetomulint256-a-int256-b)
    * [ln(*uint256* `x`)](#lnuint256-x)
    * [floorLog2(*uint256* `x`)](#floorlog2uint256-x)
    * [safeToAdd(*uint256* `a`, *uint256* `b`)](#safetoadduint256-a-uint256-b)
    * [add(*uint256* `a`, *uint256* `b`)](#adduint256-a-uint256-b)
    * [safeToSub(*int256* `a`, *int256* `b`)](#safetosubint256-a-int256-b)
    * [add(*int256* `a`, *int256* `b`)](#addint256-a-int256-b)
    * [sub(*int256* `a`, *int256* `b`)](#subint256-a-int256-b)
    * [sub(*uint256* `a`, *uint256* `b`)](#subuint256-a-uint256-b)
    * [mul(*int256* `a`, *int256* `b`)](#mulint256-a-int256-b)
    * [mul(*uint256* `a`, *uint256* `b`)](#muluint256-a-uint256-b)
    * [safeToMul(*uint256* `a`, *uint256* `b`)](#safetomuluint256-a-uint256-b)
    * [max(*int256[]* `nums`)](#maxint256-nums)
    * [safeToAdd(*int256* `a`, *int256* `b`)](#safetoaddint256-a-int256-b)
    * [safeToSub(*uint256* `a`, *uint256* `b`)](#safetosubuint256-a-uint256-b)
    * [exp(*int256* `x`)](#expint256-x)

# Math

### Math library - Allows calculation of logarithmic and exponential functions

- **Author**: Alan Lu - <alan.lu@gnosis.pm>Stefan George - <stefan@gnosis.pm>
- **Constructor**: Math()
- This contract does **not** have a fallback function.

## Math Accessors

* *uint256* LN2() `02780677`
* *uint256* LOG2_E() `24902e24`
* *uint256* ONE() `c2ee3a08`

## Math Functions

### safeToMul(*int256* `a`, *int256* `b`)

- **State mutability**: `view`
- **Signature hash**: `1f47ba29`

Returns whether a multiply operation causes an overflow

#### Inputs

| type     | name | description   |
| -------- | ---- | ------------- |
| *int256* | `a`  | First factor  |
| *int256* | `b`  | Second factor |

#### Outputs

| type   | description            |
| ------ | ---------------------- |
| *bool* | Did no overflow occur? |

### ln(*uint256* `x`)

- **State mutability**: `view`
- **Signature hash**: `24d4e90a`

Returns natural logarithm value of given x

#### Inputs

| type      | name | description |
| --------- | ---- | ----------- |
| *uint256* | `x`  | x           |

#### Outputs

| type     | description |
| -------- | ----------- |
| *int256* | ln(x)       |

### floorLog2(*uint256* `x`)

- **State mutability**: `view`
- **Signature hash**: `45b8bafc`

Returns base 2 logarithm value of given x

#### Inputs

| type      | name | description |
| --------- | ---- | ----------- |
| *uint256* | `x`  | x           |

#### Outputs

| type     | name | description       |
| -------- | ---- | ----------------- |
| *int256* | `lo` | logarithmic value |

### safeToAdd(*uint256* `a`, *uint256* `b`)

- **State mutability**: `view`
- **Signature hash**: `4e30a66c`

Returns whether an add operation causes an overflow

#### Inputs

| type      | name | description   |
| --------- | ---- | ------------- |
| *uint256* | `a`  | First addend  |
| *uint256* | `b`  | Second addend |

#### Outputs

| type   | description            |
| ------ | ---------------------- |
| *bool* | Did no overflow occur? |

### add(*uint256* `a`, *uint256* `b`)

- **State mutability**: `view`
- **Signature hash**: `771602f7`

Returns sum if no overflow occurred

#### Inputs

| type      | name | description   |
| --------- | ---- | ------------- |
| *uint256* | `a`  | First addend  |
| *uint256* | `b`  | Second addend |

#### Outputs

| type      | description |
| --------- | ----------- |
| *uint256* | Sum         |

### safeToSub(*int256* `a`, *int256* `b`)

- **State mutability**: `view`
- **Signature hash**: `90304341`

Returns whether a subtraction operation causes an underflow

#### Inputs

| type     | name | description |
| -------- | ---- | ----------- |
| *int256* | `a`  | Minuend     |
| *int256* | `b`  | Subtrahend  |

#### Outputs

| type   | description             |
| ------ | ----------------------- |
| *bool* | Did no underflow occur? |

### add(*int256* `a`, *int256* `b`)

- **State mutability**: `view`
- **Signature hash**: `a5f3c23b`

Returns sum if no overflow occurred

#### Inputs

| type     | name | description   |
| -------- | ---- | ------------- |
| *int256* | `a`  | First addend  |
| *int256* | `b`  | Second addend |

#### Outputs

| type     | description |
| -------- | ----------- |
| *int256* | Sum         |

### sub(*int256* `a`, *int256* `b`)

- **State mutability**: `view`
- **Signature hash**: `adefc37b`

Returns difference if no overflow occurred

#### Inputs

| type     | name | description |
| -------- | ---- | ----------- |
| *int256* | `a`  | Minuend     |
| *int256* | `b`  | Subtrahend  |

#### Outputs

| type     | description |
| -------- | ----------- |
| *int256* | Difference  |

### sub(*uint256* `a`, *uint256* `b`)

- **State mutability**: `view`
- **Signature hash**: `b67d77c5`

Returns difference if no overflow occurred

#### Inputs

| type      | name | description |
| --------- | ---- | ----------- |
| *uint256* | `a`  | Minuend     |
| *uint256* | `b`  | Subtrahend  |

#### Outputs

| type      | description |
| --------- | ----------- |
| *uint256* | Difference  |

### mul(*int256* `a`, *int256* `b`)

- **State mutability**: `view`
- **Signature hash**: `bbe93d91`

Returns product if no overflow occurred

#### Inputs

| type     | name | description   |
| -------- | ---- | ------------- |
| *int256* | `a`  | First factor  |
| *int256* | `b`  | Second factor |

#### Outputs

| type     | description |
| -------- | ----------- |
| *int256* | Product     |

### mul(*uint256* `a`, *uint256* `b`)

- **State mutability**: `view`
- **Signature hash**: `c8a4ac9c`

Returns product if no overflow occurred

#### Inputs

| type      | name | description   |
| --------- | ---- | ------------- |
| *uint256* | `a`  | First factor  |
| *uint256* | `b`  | Second factor |

#### Outputs

| type      | description |
| --------- | ----------- |
| *uint256* | Product     |

### safeToMul(*uint256* `a`, *uint256* `b`)

- **State mutability**: `view`
- **Signature hash**: `cb10fa76`

Returns whether a multiply operation causes an overflow

#### Inputs

| type      | name | description   |
| --------- | ---- | ------------- |
| *uint256* | `a`  | First factor  |
| *uint256* | `b`  | Second factor |

#### Outputs

| type   | description            |
| ------ | ---------------------- |
| *bool* | Did no overflow occur? |

### max(*int256[]* `nums`)

- **State mutability**: `view`
- **Signature hash**: `ccc13814`

Returns maximum of an array

#### Inputs

| type       | name   | description             |
| ---------- | ------ | ----------------------- |
| *int256[]* | `nums` | Numbers to look through |

#### Outputs

| type     | name  | description    |
| -------- | ----- | -------------- |
| *int256* | `max` | Maximum number |

### safeToAdd(*int256* `a`, *int256* `b`)

- **State mutability**: `view`
- **Signature hash**: `dc08a80b`

Returns whether an add operation causes an overflow

#### Inputs

| type     | name | description   |
| -------- | ---- | ------------- |
| *int256* | `a`  | First addend  |
| *int256* | `b`  | Second addend |

#### Outputs

| type   | description            |
| ------ | ---------------------- |
| *bool* | Did no overflow occur? |

### safeToSub(*uint256* `a`, *uint256* `b`)

- **State mutability**: `view`
- **Signature hash**: `e31c71c4`

Returns whether a subtraction operation causes an underflow

#### Inputs

| type      | name | description |
| --------- | ---- | ----------- |
| *uint256* | `a`  | Minuend     |
| *uint256* | `b`  | Subtrahend  |

#### Outputs

| type   | description             |
| ------ | ----------------------- |
| *bool* | Did no underflow occur? |

### exp(*int256* `x`)

- **State mutability**: `view`
- **Signature hash**: `e46751e3`

Returns natural exponential function value of given x

#### Inputs

| type     | name | description |
| -------- | ---- | ----------- |
| *int256* | `x`  | x           |

#### Outputs

| type      | description |
| --------- | ----------- |
| *uint256* | e**x        |
