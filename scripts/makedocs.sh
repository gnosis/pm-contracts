#!/usr/bin/env sh

export DOCS_DIR=docs/source

mkdir -p $DOCS_DIR
mv $DOCS_DIR/index.rst .
rm -f $DOCS_DIR/*.rst
mv index.rst $DOCS_DIR/
find contracts -name '*.sol' ! -name 'Migrations.sol' -type f -exec bash -c './node_modules/.bin/solmd {} --dest $DOCS_DIR/`basename {} .sol`.md' \;
find $DOCS_DIR -name '*.md' -exec sh -c 'pandoc --from=markdown --to=rst --output=${0%.md}.rst ${0}' {} \;
rm -f $DOCS_DIR/*.md
