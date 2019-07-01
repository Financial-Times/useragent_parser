#!/usr/bin/env bash

set -o errexit
set -o pipefail
[[ "${DEBUG}" == 'true' ]] && set -o xtrace
set -o nounset

npm ci;

git remote add -f uap-ref-impl https://github.com/ua-parser/uap-ref-impl.git || true;
git remote add -f uap-core https://github.com/ua-parser/uap-core.git || true;

git fetch uap-core master;
git fetch uap-ref-impl master;

git subtree pull --prefix uap-ref-impl uap-ref-impl master --squash;
git subtree pull --prefix uap-core uap-core master --squash;

node ./compilers/vcl.js;
node ./compilers/js.js;

echo 'updating useragent_parser complete.';