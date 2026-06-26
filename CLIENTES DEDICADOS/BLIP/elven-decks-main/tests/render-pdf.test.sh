#!/usr/bin/env bash
# tests/render-pdf.test.sh — verifies render-deck.js produces non-empty PDF for each pass fixture.

set -eu

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RENDER="$HERE/../skill/scripts/render-deck.js"

green() { printf "\033[32m%s\033[0m" "$1"; }
red()   { printf "\033[31m%s\033[0m" "$1"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail_count=0

for f in "$HERE"/fixtures/pass-*.html; do
  out="$TMP/$(basename "$f" .html).pdf"
  if node "$RENDER" "$f" --out "$out" >/dev/null 2>&1; then
    if [ -s "$out" ]; then
      size=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out" 2>/dev/null || echo "?")
      echo "  $(green "ok") $f -> ${size} bytes"
    else
      echo "  $(red "FAIL") empty PDF for $f"
      fail_count=$((fail_count + 1))
    fi
  else
    echo "  $(red "FAIL") render exit non-zero for $f"
    node "$RENDER" "$f" --out "$out" || true
    fail_count=$((fail_count + 1))
  fi
done

echo ""
if [ "$fail_count" -eq 0 ]; then
  echo "$(green "render tests: ALL PASS")"
  exit 0
else
  echo "$(red "render tests: $fail_count failure(s)")"
  exit 1
fi
