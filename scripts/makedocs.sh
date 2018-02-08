#!/usr/bin/env bash

rm -r docs
find contracts -name '*.sol' ! -name 'Migrations.sol' -type f -exec bash -c 'mkdir -p docs/`basename {} .sol`; ./node_modules/.bin/solmd {} --dest docs/`basename {} .sol`/index.md' \;
