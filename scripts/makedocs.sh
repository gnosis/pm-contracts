#!/usr/bin/env bash

rm -r docs
mkdir -p docs/docs
find contracts -name '*.sol' ! -name 'Migrations.sol' -type f -exec bash -c './node_modules/.bin/solmd {} --dest docs/docs/`basename {} .sol`.md' \;
