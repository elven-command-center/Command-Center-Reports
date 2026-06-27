---
name: feedback-orgs-json
description: Ao atualizar orgs.json ou queries.md da skill, sempre atualizar todas as cópias existentes simultaneamente
metadata:
  type: feedback
---

# Skills — Atualizar Todas as Cópias

## Estrutura de diretórios

`~/.claude/skills` é uma **junção (symlink)** para `C:\Users\PC\OneDrive\Desktop\CLAUDE\SKILLS` — são a mesma pasta.

## Cópias de orgs.json (5 no total — todas devem ser idênticas)

1. `C:\Users\PC\OneDrive\Desktop\CLAUDE\SKILLS\elven-cc-data-analysis\references\orgs.json` (= ~/.claude/skills/...)
2. `C:\Users\PC\OneDrive\Desktop\CLAUDE\SKILLS\elven-cc-additional-information\references\orgs.json` (= ~/.claude/skills/...)
3. `C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\REPORT CC\skills\elven-cc-data-analysis\references\orgs.json`
4. `C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\REPORT CC\skills\elven-cc-additional-information\references\orgs.json`
5. `C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\CLIENTES CROSS\orgs.json`

## Cópias de queries.md (2 no total — devem ser idênticas)

1. `C:\Users\PC\OneDrive\Desktop\CLAUDE\SKILLS\elven-cc-data-analysis\references\queries.md` (= ~/.claude/skills/...)
2. `C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\REPORT CC\skills\elven-cc-data-analysis\references\queries.md`

**Why:** Há múltiplas cópias em uso por skills e projetos diferentes. A cópia SKILLS/additional-information estava desatualizada (sem Blip/Kontik/Unicred) — descoberta em auditoria de 27/06/2026.

**How to apply:** Ao receber pedido de add/update em qualquer arquivo de referência da skill, editar todas as cópias em paralelo e verificar com hash MD5 que são idênticas.
