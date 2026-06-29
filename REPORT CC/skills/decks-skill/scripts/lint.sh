#!/usr/bin/env bash
# @elven-observability/decks-skill - lint
#
# Binary 10/10 check for Elven deck HTML files. Exit 0 only when every file
# passes every rule. Each failure prints the rule ID + reason.
#
# Modelo kontik: o lint valida a MOLDURA (slide variant, .content, .kicker,
# .logo, canvas, tema, cover-first, sem emoji). A composição interna é livre.
#
# Usage:
#   decks-skill lint <file.html> [<file.html>...]

set -u

PASS_COUNT=0
FAIL_COUNT=0

red()    { printf "\033[31m%s\033[0m" "$1"; }
green()  { printf "\033[32m%s\033[0m" "$1"; }
yellow() { printf "\033[33m%s\033[0m" "$1"; }

if [ $# -eq 0 ]; then
  cat >&2 <<'USAGE'
Usage: decks-skill lint <file.html> [<file.html>...]

Lints Elven deck HTML files against 10 binary frame rules.
Exit 0: all files pass 10/10. Exit 1: at least one failure.
USAGE
  exit 2
fi

lint_one() {
  local file="$1"
  local failures=0
  local -a errors=()

  if [ ! -f "$file" ]; then
    echo "$(red "FAIL") $file: file not found"
    return 1
  fi

  # Stripped view: HTML comments, <style> and <script> removed, so structural
  # counts (L4-L9) never get fooled by class names mentioned in comments or JS.
  local stripped
  stripped=$(perl -0777 -pe 's/<!--.*?-->//gs; s/<style\b.*?<\/style>//gsi; s/<script\b.*?<\/script>//gsi;' "$file" 2>/dev/null || cat "$file")

  # L1: DOCTYPE + lang="pt-BR"
  if ! grep -qiE '<!DOCTYPE html>' "$file"; then
    errors+=("L1: missing <!DOCTYPE html>")
    ((failures++)) || true
  elif ! grep -qiE '<html[^>]*lang="pt-BR"' "$file"; then
    errors+=("L1: missing lang=\"pt-BR\" on <html>")
    ((failures++)) || true
  fi

  # L2: <title> present and non-empty
  if ! grep -qiE '<title>[^<]+</title>' "$file"; then
    errors+=("L2: missing or empty <title>")
    ((failures++)) || true
  fi

  # L3: theme present (elven-deck.css link OR :root with --teal:#00bfa5)
  if ! grep -qE 'elven-deck\.css' "$file" \
     && ! grep -qE -- '--teal:[[:space:]]*#00bfa5' "$file"; then
    errors+=("L3: missing elven-deck.css link or inline brand tokens (--teal:#00bfa5)")
    ((failures++)) || true
  fi

  # Count slides (slide, slide cover, slide dark, slide split-dark)
  local slide_count
  slide_count=$(printf '%s' "$stripped" | grep -coE 'class="slide([ "])' || true)

  # L4: at least one .slide
  if [ "$slide_count" -eq 0 ]; then
    errors+=("L4: no .slide elements found")
    ((failures++)) || true
  fi

  # L5: canvas 1280x720 declared (--w/--h, or width/height, or theme link)
  if ! grep -qE -- '--w:[[:space:]]*1280px' "$file" \
     && ! grep -qE -- 'width:[[:space:]]*1280px' "$file" \
     && ! grep -qE 'elven-deck\.css' "$file"; then
    errors+=("L5: canvas 1280x720 not declared (need --w/--h, width/height, or elven-deck.css link)")
    ((failures++)) || true
  fi

  # L6: first slide carries the cover variant. Aceita o token `cover` em
  # qualquer posição da lista de classes (ex: class="slide layout-cover cover"),
  # mas exige o token isolado - `layout-cover` sozinho NÃO conta.
  local first_slide
  first_slide=$(printf '%s' "$stripped" | grep -nE 'class="slide([ "])' | head -n 1)
  if [ -n "$first_slide" ] && ! echo "$first_slide" | grep -qE 'class="slide[^"]* cover[ "]'; then
    errors+=("L6: first slide is missing the \"cover\" variant (use class=\"slide ... cover\")")
    ((failures++)) || true
  fi

  # L7: every slide has a .content box
  local content_count
  content_count=$(printf '%s' "$stripped" | grep -coE 'class="content([ "])' || true)
  if [ "$slide_count" -gt 0 ] && [ "$content_count" -lt "$slide_count" ]; then
    errors+=("L7: $((slide_count - content_count)) of $slide_count slide(s) missing a .content box")
    ((failures++)) || true
  fi

  # L8: every slide has a .kicker
  local kicker_count
  kicker_count=$(printf '%s' "$stripped" | grep -coE 'class="kicker([ "])' || true)
  if [ "$slide_count" -gt 0 ] && [ "$kicker_count" -lt "$slide_count" ]; then
    errors+=("L8: $((slide_count - kicker_count)) of $slide_count slide(s) missing a .kicker")
    ((failures++)) || true
  fi

  # L9: every slide has a .logo
  local logo_count
  logo_count=$(printf '%s' "$stripped" | grep -coE 'class="logo([ "])' || true)
  if [ "$slide_count" -gt 0 ] && [ "$logo_count" -lt "$slide_count" ]; then
    errors+=("L9: $((slide_count - logo_count)) of $slide_count slide(s) missing a .logo")
    ((failures++)) || true
  fi

  # L10: no emoji in visible body text (skip <style>/<script>/<pre>/<code>/comments)
  if command -v python3 >/dev/null 2>&1; then
    if ! python3 - "$file" <<'PYEOF'
import re, sys
content = open(sys.argv[1], encoding='utf-8').read()
content = re.sub(r'<style[\s\S]*?</style>', '', content)
content = re.sub(r'<script[\s\S]*?</script>', '', content)
content = re.sub(r'<pre[\s\S]*?</pre>', '', content)
content = re.sub(r'<code[\s\S]*?</code>', '', content)
content = re.sub(r'<!--[\s\S]*?-->', '', content)
emoji = re.compile(
    r'[\U0001F300-\U0001FAFF'
    r'\U0001F600-\U0001F64F'
    r'\U0001F680-\U0001F6FF'
    r'\U00002600-\U000026FF'
    r'\U00002700-\U000027BF'
    r'\U0001F900-\U0001F9FF'
    r']'
)
sys.exit(1 if emoji.search(content) else 0)
PYEOF
    then
      errors+=("L10: emoji detected in visible body text (use .tag instead)")
      ((failures++)) || true
    fi
  fi

  local passed=$((10 - failures))
  if [ "$failures" -eq 0 ]; then
    echo "$(green "PASS") $file ($passed/10)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "$(red "FAIL") $file ($passed/10):"
    for e in "${errors[@]}"; do
      echo "  - $e"
    done
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

for f in "$@"; do
  lint_one "$f"
done

echo ""
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "Summary: $(green "$PASS_COUNT pass") / $(yellow "0 fail")"
  exit 0
else
  echo "Summary: $(green "$PASS_COUNT pass") / $(red "$FAIL_COUNT fail")"
  exit 1
fi
