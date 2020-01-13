#!/usr/bin/env bash

set -o errexit
set -o pipefail
[[ "${DEBUG}" == 'true' ]] && set -o xtrace
set -o nounset

npm ci;

# create a working branch just to avoid messing up master if something goes wrong
git checkout -B update-uap-core-regexes master

# create a remote for the core repository and fetch from it
git remote add -f uap-ref-impl-remote https://github.com/ua-parser/uap-ref-impl.git || true;
git remote add -f uap-core-remote https://github.com/ua-parser/uap-core.git || true;

# create a branch with the contents of the core repository's master branch
git branch -f uap-ref-impl-branch uap-ref-impl-remote/master
git branch -f uap-core-branch uap-core-remote/master

# update the core subtree
git merge --squash -s subtree --allow-unrelated-histories --no-commit uap-ref-impl-branch
git merge --squash -s subtree --allow-unrelated-histories --no-commit uap-core-branch

# commit the updates
node ./compilers/vcl.js;
node ./compilers/js.js;
git add lib/
git commit -m 'feat: update to the latest uap-core regex list'

# push the commit to GitHub
# git push

echo 'updating complete.';