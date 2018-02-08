#!/usr/bin/env bash

rm -r docs
mkdir docs
find contracts -name '*.sol' ! -name 'Migrations.sol' -type f -exec bash -c './node_modules/.bin/solmd {} --dest docs/`basename {} .sol`.md' \;
