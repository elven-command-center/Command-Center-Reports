# Kontik — NOC Command Center

Monitoramento operacional do cliente **Kontik** (org `e6c88769-8a85-42be-8709-fc67660d3f5a`)
pela Elven Works, com relatórios periódicos do Command Center gerados em deck 16:9.

Os relatórios consideram **apenas** os eventos atendidos pelo `responder_names = "Time NOC - Elven"`.

---

## Estrutura do projeto

```
KONTIK/
├── CLAUDE.md                 — instruções e workflow do projeto (fonte de verdade)
├── README.md                 — este arquivo
├── .mcp.json                 — MCP do Power BI (modeling)
├── _extract_range.py         — extração de métricas do Data Warehouse (ODBC)
├── _cols.py                  — utilitário de inspeção de colunas
├── setup-skill.ps1           — verifica/instala a skill de decks
├── elven-decks-main/         — código-fonte da skill de decks
└── Relatórios/
    ├── _template-noc/        — TEMPLATE PADRÃO (base canônica para novos decks)
    └── noc-kontik-<período>/ — um deck por relatório
        ├── deck.html
        ├── elven-deck.css
        ├── elven-deck-charts.js
        ├── assets/
        └── noc-kontik-<período>.pdf
```

---

## Origem dos dados

Os relatórios são gerados **direto do Data Warehouse** via ODBC (sem `.docx`):

- **DSN:** `PostgreSQL35W` · DB `data_warehouse` · schema `dbt_prd` · `pyodbc`
- **Tabelas-chave:** `fct__events`, `"dim__eventsMetrics"` (ttr/tta em segundos, ack, resolved),
  `"dim__eventsTags"` (tags `grafana_folder:`) e `dsh__events_noc_investigation`
  (1 linha por evento, com `responder_names`, `has_runbook`, `org_name`).
- **Filtro fixo do cliente:** `'Time NOC - Elven' = ANY(r.responder_names)`.

O script `_extract_range.py` já traz o `ORG`, o range de datas e o join de responder; ele imprime
um JSON com todos os blocos usados nos slides.

---

## Como gerar um relatório

> **Gatilho:** ao pedir "execute o relatório", informe **a data/período** — o workflow roda de
> forma autônoma a partir daí. Detalhes completos (marcadores, lint, render) estão no [CLAUDE.md](CLAUDE.md).

1. **Extrair métricas:** ajustar `D1`/`D2` em `_extract_range.py` e rodar `python _extract_range.py`.
2. **Criar a pasta do deck** copiando `Relatórios/_template-noc/` para `Relatórios/noc-kontik-<período>/`.
3. **Editar `deck.html`** com os dados reais (substituir os marcadores `{{...}}`).
4. **Lint:** `bash ~/.claude/skills/decks-skill/scripts/lint.sh Relatórios/<slug>/deck.html`
   (9/10 — a regra L10 é falso positivo no Windows, por ausência de `python3`).
5. **Render PDF:** `node ~/.claude/skills/decks-skill/scripts/render-deck.js Relatórios/<slug>/deck.html --out Relatórios/<slug>/<slug>.pdf`

---

## Estrutura do deck (11 slides)

1. Capa — cliente em destaque + 4 métricas (MTTR, total, taxa de resolução, runbooks executados)
2. Resumo executivo
3. Status dos eventos — matriz ACK × resolução
4. Severidade
5. Volume de alertas — top 5 por ocorrências
6. Recorrência — histórico completo (com a janela real de datas rotulada)
7. Análise de TTR prolongado
8. Tags e contexto operacional
9. Alertas críticos em aberto
10. Detalhamento dos eventos — tabela por título (Qtd · Runbook · TTR médio)
11. Conclusão e próximos passos

**Gráficos:** barras SVG com rótulo de valor em cada barra (motor `elven-deck-charts.js`).

---

## Convenções (locked)

- **Branding:** "Command Center" (nunca "NOC" no kicker/título), logo `elven-command-center.png`.
- **Cliente na capa:** label "CLIENTE" + nome grande, da grafia oficial de `org_name`.
- **MTTR** no formato `HH:MM:SS` (MTTA não entra no deck).
- **Recorrência** é histórica — sempre rotular o período real, distinto do turno.
- Demais convenções de conteúdo/layout em [CLAUDE.md](CLAUDE.md).

---

## Notas de ambiente

- Usar `python` (não `python3`) no terminal Windows.
- Puppeteer (render do PDF) já instalado em `~/.claude/skills/decks-skill/node_modules/`.
- A skill de decks fica em `C:\Users\PC\.claude\skills\decks-skill\`; rodar `./setup-skill.ps1` para verificar/reinstalar.
