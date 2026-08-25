#!/usr/bin/env bash
set -euo pipefail

ZIP_PATH="${1:?usage: $0 <path-to-extension-zip>}"

: "${CHROME_EXTENSION_ID:?CHROME_EXTENSION_ID is not set}"
: "${CHROME_CLIENT_ID:?CHROME_CLIENT_ID is not set}"
: "${CHROME_CLIENT_SECRET:?CHROME_CLIENT_SECRET is not set}"
: "${CHROME_REFRESH_TOKEN:?CHROME_REFRESH_TOKEN is not set}"

echo "Requesting access token..."
TOKEN_RESPONSE=$(curl -sS -X POST https://oauth2.googleapis.com/token \
    -d "client_id=${CHROME_CLIENT_ID}" \
    -d "client_secret=${CHROME_CLIENT_SECRET}" \
    -d "refresh_token=${CHROME_REFRESH_TOKEN}" \
    -d "grant_type=refresh_token")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token // empty')
if [ -z "$ACCESS_TOKEN" ]; then
    echo "Failed to obtain access token:" >&2
    echo "$TOKEN_RESPONSE" >&2
    exit 1
fi

echo "Uploading ${ZIP_PATH} to item ${CHROME_EXTENSION_ID}..."
UPLOAD_RESPONSE=$(curl -sS -X PUT \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "x-goog-api-version: 2" \
    -T "${ZIP_PATH}" \
    "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${CHROME_EXTENSION_ID}")

UPLOAD_STATE=$(echo "$UPLOAD_RESPONSE" | jq -r '.uploadState // empty')
if [ "$UPLOAD_STATE" != "SUCCESS" ]; then
    echo "Upload failed:" >&2
    echo "$UPLOAD_RESPONSE" >&2
    exit 1
fi

echo "Publishing item ${CHROME_EXTENSION_ID}..."
PUBLISH_RESPONSE=$(curl -sS -X POST \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "x-goog-api-version: 2" \
    -H "Content-Length: 0" \
    "https://www.googleapis.com/chromewebstore/v1.1/items/${CHROME_EXTENSION_ID}/publish")

PUBLISH_STATUS=$(echo "$PUBLISH_RESPONSE" | jq -r '.status[0] // empty')
if [ "$PUBLISH_STATUS" != "OK" ]; then
    echo "Publish failed:" >&2
    echo "$PUBLISH_RESPONSE" >&2
    exit 1
fi

echo "Published successfully."
