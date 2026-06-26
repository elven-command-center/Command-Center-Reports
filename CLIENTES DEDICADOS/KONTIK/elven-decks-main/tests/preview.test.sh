#!/usr/bin/env bash
# tests/preview.test.sh — verifies preview-deck.js produces 1 PNG per slide + contact-sheet.

set -eu

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PREVIEW="$HERE/../skill/scripts/preview-deck.js"

green() { printf "\033[32m%s\033[0m" "$1"; }
red()   { printf "\033[31m%s\033[0m" "$1"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail_count=0

for f in "$HERE"/fixtures/pass-*.html; do
  base="$(basename "$f" .html)"
  outdir="$TMP/$base/preview"
  parent="$TMP/$base"
  mkdir -p "$outdir"

  if node "$PREVIEW" "$f" --out-dir "$outdir" >/dev/null 2>&1; then
    count=$(ls "$outdir"/slide-*.png 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -ge 1 ]; then
      if [ -s "$parent/contact-sheet.png" ]; then
        echo "  $(green "ok") $f -> ${count} slide png(s) + contact-sheet"
      else
        echo "  $(red "FAIL") missing contact-sheet for $f"
        fail_count=$((fail_count + 1))
      fi
    else
      echo "  $(red "FAIL") no slide PNGs for $f"
      fail_count=$((fail_count + 1))
    fi
  else
    echo "  $(red "FAIL") preview exit non-zero for $f"
    node "$PREVIEW" "$f" --out-dir "$outdir" || true
    fail_count=$((fail_count + 1))
  fi
done

echo ""
if [ "$fail_count" -eq 0 ]; then
  echo "$(green "preview tests: ALL PASS")"
  exit 0
else
  echo "$(red "preview tests: $fail_count failure(s)")"
  exit 1
fi
