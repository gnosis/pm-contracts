#!/usr/bin/env bash

rm -r docs
find contracts -name '*.sol' ! -name 'Migrations.sol' -type f -exec bash -c 'mkdir -p docs/docs/`basename {} .sol`; ./node_modules/.bin/solmd {} --dest docs/docs/`basename {} .sol`/index.md' \;
