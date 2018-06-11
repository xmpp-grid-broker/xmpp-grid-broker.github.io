#!/usr/bin/env bash
set -e
set -x
set -u

npm install
npm run ng -- lint
npm run ng -- test --single-run --no-progress --code-coverage --browsers ChromeHeadlessNoSandbox
npm run compodoc -- --silent
npm run ng -- build --prod --aot --no-progress

