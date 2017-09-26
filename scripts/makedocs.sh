#!/usr/bin/env bash

npm i @digix/doxity
find contracts test -name '*.sol' -type f -print0 | xargs -0 sed -i -e 's/pragma solidity 0/pragma solidity ^0/'
node_modules/.bin/doxity init
node_modules/.bin/doxity build
rm -r .doxityrc scripts/doxity/
find contracts test -name '*.sol' ! -name 'Migrations.sol' -type f -print0 | xargs -0 sed -i -e 's/pragma solidity ^0/pragma solidity 0/'
npm un @digix/doxity
