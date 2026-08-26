#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

pnpm run build

rm -rf dist
mkdir -p dist

zip -r dist/extension.zip \
    manifest.json \
    popup/index.html \
    popup/css \
    popup/js

echo "Created dist/extension.zip"
