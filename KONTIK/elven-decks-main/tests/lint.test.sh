#!/usr/bin/env bash
# tests/lint.test.sh — asserts pass-* fixtures exit 0 and fail-* fixtures exit 1.

set -eu

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LINT="$HERE/../skill/scripts/lint.sh"

green() { printf "\033[32m%s\033[0m" "$1"; }
red()   { printf "\033[31m%s\033[0m" "$1"; }

fail_count=0

echo "=== pass fixtures (must exit 0) ==="
for f in "$HERE"/fixtures/pass-*.html; do
  if bash "$LINT" "$f" >/dev/null 2>&1; then
    echo "  $(green "ok") $f"
  else
    echo "  $(red "FAIL") expected pass on $f"
    bash "$LINT" "$f" || true
    fail_count=$((fail_count + 1))
  fi
done

echo ""
echo "=== fail fixtures (must exit 1) ==="
for f in "$HERE"/fixtures/fail-*.html; do
  if bash "$LINT" "$f" >/dev/null 2>&1; then
    echo "  $(red "FAIL") expected fail on $f (but lint passed)"
    fail_count=$((fail_count + 1))
  else
    echo "  $(green "ok") $f"
  fi
done

echo ""
if [ "$fail_count" -eq 0 ]; then
  echo "$(green "lint tests: ALL PASS")"
  exit 0
else
  echo "$(red "lint tests: $fail_count failure(s)")"
  exit 1
fi
