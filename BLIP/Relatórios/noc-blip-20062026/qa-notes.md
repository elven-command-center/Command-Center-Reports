# QA notes — NOC Blip 20/06/2026

- **Lint:** 9/10. Único fail é L10 (emoji em texto) — falso positivo no Windows (python3 ausente). Não bloqueante (ver CLAUDE.md / `feedback-python3-windows`).
- **PDF:** renderizado via Puppeteer — `noc-blip-20062026.pdf` (685 KB, 10 slides).
- **Marcadores `{{...}}`:** todos substituídos; nenhum remanescente.

## Consistências validadas
- Status: 614 + 345 + 8 + 0 = **967** = total ✓
- Severidade: 229 + 738 = **967** ✓
- Resolução: 959 resolvidos / 967 = 99% ; abertos = 8 ✓ (8 = linha "ACK sem Resolução")

## Decisões / desvios do padrão
- **Slide 09** tem **3 linhas** (não 5): só existem 3 títulos distintos em aberto (8 eventos, 0 sev-1). Removidas as linhas 4–5 do template para não deixar marcadores vazios.
- **Severidade dos abertos:** todos `not-classified` — não apliquei `risk high` na coluna de severidade (não há sev-1). Mantive `risk` apenas no TTR acumulado (100h+), que é o sinal real.
- **MTTR 03:39:07** é alto vs. dias anteriores (24/06 = 00:43:44). Driver: cauda longa — 314 eventos (32%) > 30 min + outlier de 124h (Node CPU Usage - LGTM). Narrativa de capa/resumo/conclusão explicita que é a média puxada pela cauda, não degradação geral.
- MTTA não citado em nenhum slide (padrão locked).
- Branding "Command Center", rodapé só com período, recorrência em verde — conforme `_template-noc`.
