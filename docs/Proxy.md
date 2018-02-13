* [Proxied](#proxied)
  * [Accessors](#proxied-accessors)
* [Proxy](#proxy)
  * [Accessors](#proxy-accessors)

# Proxied

### Proxied - indicates that a contract will be proxied. Also defines storage requirements for Proxy.

- **Author**: Alan Lu - <alan@gnosis.pm>
- **Constructor**: Proxied()
- This contract does **not** have a fallback function.

## Proxied Accessors

* *address* masterCopy() `a619486e`

# Proxy

### Proxy - Generic proxy contract allows to execute all transactions applying the code of a master contract.

- **Author**: Stefan George - <stefan@gnosis.pm>
- **Constructor**: Proxy(*address* `_masterCopy`)
- This contract has a `payable` fallback function.

## Proxy Accessors

* *address* masterCopy() `a619486e`
