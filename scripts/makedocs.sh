#!/usr/bin/env bash

npm i @digix/doxity
node_modules/.bin/doxity init
sed -i -e 's/linkPrefix = .*/linkPrefix = "\/gnosis-contracts"/' scripts/doxity/config.toml
node_modules/.bin/doxity build
rm -r .doxityrc scripts/doxity/
npm un @digix/doxity
