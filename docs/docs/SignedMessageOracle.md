* [SignedMessageOracle](#signedmessageoracle)
  * [Accessors](#signedmessageoracle-accessors)
  * [Events](#signedmessageoracle-events)
    * [SignerReplacement(*address* indexed `newSigner`)](#signerreplacementaddress-indexed-newsigner)
    * [OutcomeAssignment(*int256* `outcome`)](#outcomeassignmentint256-outcome)
  * [Functions](#signedmessageoracle-functions)
    * [replaceSigner(*address* `newSigner`, *uint256* `_nonce`, *uint8* `v`, *bytes32* `r`, *bytes32* `s`)](#replacesigneraddress-newsigner-uint256-_nonce-uint8-v-bytes32-r-bytes32-s)
    * [getOutcome()](#getoutcome)
    * [isOutcomeSet()](#isoutcomeset)
    * [setOutcome(*int256* `_outcome`, *uint8* `v`, *bytes32* `r`, *bytes32* `s`)](#setoutcomeint256-_outcome-uint8-v-bytes32-r-bytes32-s)

# SignedMessageOracle

### Signed message oracle contract - Allows to set an outcome with a signed message

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: SignedMessageOracle(*bytes32* `_descriptionHash`, *uint8* `v`, *bytes32* `r`, *bytes32* `s`)
- This contract does **not** have a fallback function.

## SignedMessageOracle Accessors

* *address* signer() `238ac933`
* *int256* outcome() `27793f87`
* *bytes32* descriptionHash() `85dcee93`
* *bool* isSet() `c65fb380`

## SignedMessageOracle Events

### SignerReplacement(*address* indexed `newSigner`)

**Signature hash**: `db3046afd053bee6427d6355ee95671fceb37ee6b944866f9ea86eaa213dac68`

### OutcomeAssignment(*int256* `outcome`)

**Signature hash**: `b1aaa9f4484acc283375c8e495a44766e4026170797dc9280b4ae2ab5632fb71`

## SignedMessageOracle Functions

### replaceSigner(*address* `newSigner`, *uint256* `_nonce`, *uint8* `v`, *bytes32* `r`, *bytes32* `s`)

- **State mutability**: `nonpayable`
- **Signature hash**: `5011e399`

Replaces signer

#### Inputs

| type      | name        | description                            |
| --------- | ----------- | -------------------------------------- |
| *address* | `newSigner` | New signer                             |
| *uint256* | `_nonce`    | Unique nonce to prevent replay attacks |
| *uint8*   | `v`         | Signature parameter                    |
| *bytes32* | `r`         | Signature parameter                    |
| *bytes32* | `s`         | Signature parameter                    |

### getOutcome()

- **State mutability**: `view`
- **Signature hash**: `7e7e4b47`

Returns winning outcome

#### Outputs

| type     | description |
| -------- | ----------- |
| *int256* | Outcome     |

### isOutcomeSet()

- **State mutability**: `view`
- **Signature hash**: `ccdf68f3`

Returns if winning outcome

#### Outputs

| type   | description     |
| ------ | --------------- |
| *bool* | Is outcome set? |

### setOutcome(*int256* `_outcome`, *uint8* `v`, *bytes32* `r`, *bytes32* `s`)

- **State mutability**: `nonpayable`
- **Signature hash**: `d9bf3187`

Sets outcome based on signed message

#### Inputs

| type      | name       | description          |
| --------- | ---------- | -------------------- |
| *int256*  | `_outcome` | Signed event outcome |
| *uint8*   | `v`        | Signature parameter  |
| *bytes32* | `r`        | Signature parameter  |
| *bytes32* | `s`        | Signature parameter  |
