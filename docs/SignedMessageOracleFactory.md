* [SignedMessageOracleFactory](#signedmessageoraclefactory)
  * [Accessors](#signedmessageoraclefactory-accessors)
  * [Events](#signedmessageoraclefactory-events)
    * [SignedMessageOracleCreation(*address* indexed `creator`, *address* `signedMessageOracle`, *address* `oracle`)](#signedmessageoraclecreationaddress-indexed-creator-address-signedmessageoracle-address-oracle)
  * [Functions](#signedmessageoraclefactory-functions)
    * [createSignedMessageOracle(*bytes32* `descriptionHash`, *uint8* `v`, *bytes32* `r`, *bytes32* `s`)](#createsignedmessageoraclebytes32-descriptionhash-uint8-v-bytes32-r-bytes32-s)

# SignedMessageOracleFactory

### Signed message oracle factory contract - Allows to create signed message oracle contracts

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: SignedMessageOracleFactory(*address* `_signedMessageOracleMasterCopy`)
- This contract does **not** have a fallback function.

## SignedMessageOracleFactory Accessors

* *address* signedMessageOracleMasterCopy() `515dc0be`

## SignedMessageOracleFactory Events

### SignedMessageOracleCreation(*address* indexed `creator`, *address* `signedMessageOracle`, *address* `oracle`)

**Signature hash**: `7be438e4a33b832fcd7adccf30167ee27bd3e693a5ff6daf7fcf98fb2163b7a2`

## SignedMessageOracleFactory Functions

### createSignedMessageOracle(*bytes32* `descriptionHash`, *uint8* `v`, *bytes32* `r`, *bytes32* `s`)

- **State mutability**: `nonpayable`
- **Signature hash**: `655d0862`

Creates a new signed message oracle contract

#### Inputs

| type      | name              | description                                  |
| --------- | ----------------- | -------------------------------------------- |
| *bytes32* | `descriptionHash` | Hash identifying off chain event description |
| *uint8*   | `v`               | Signature parameter                          |
| *bytes32* | `r`               | Signature parameter                          |
| *bytes32* | `s`               | Signature parameter                          |

#### Outputs

| type      | name                  | description     |
| --------- | --------------------- | --------------- |
| *address* | `signedMessageOracle` | Oracle contract |
