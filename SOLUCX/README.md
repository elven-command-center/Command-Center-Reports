# SOLUCX — Command Center

Monitoramento operacional da organização **Solucx** via Power BI e geração de
relatórios periódicos do Command Center (decks 16:9 em PDF, padrão visual Elven Works).

A partir de um relatório de eventos do dia, este projeto produz um **deck de 10 slides**
com capa, resumo executivo, breakdown de status, severidade, volume, recorrência,
análise de TTR prolongado, tags, alertas críticos em aberto e conclusão.

---

## Estrutura

```
SOLUCX/
├── Dashboard/
│   └── Métricas NOC - SOLUCX.pbix         dashboard Power BI
├── Relatórios/
│   ├── _template-noc/                   TEMPLATE PADRÃO — base autossuficiente p/ novos decks
│   │   ├── deck.html                    (marcadores {{...}})
│   │   ├── elven-deck.css               CSS canônico corrigido
│   │   ├── elven-deck-charts.js         motor de gráficos SVG
│   │   └── assets/elven-command-center.png
│   └── noc-solucx-DDMMAAAA/               um deck por dia
│       ├── deck.html
│       ├── elven-deck.css · elven-deck-charts.js · assets/
│       └── noc-solucx-DDMMAAAA.pdf
├── elven-decks-main/                    código-fonte da skill de decks
├── CLAUDE.md                            instruções operacionais detalhadas (workflow completo)
├── setup-skill.ps1                      verifica/instala a skill de decks
└── README.md
```

---

## Pré-requisitos

- **Windows** + PowerShell. Usar `python` (não `python3`) no terminal.
- **Skill de decks** instalada em `~/.claude/skills/decks-skill/`. Para verificar/reinstalar:
  ```powershell
  .\setup-skill.ps1
  ```
- **Puppeteer** (render do PDF) — já instalado junto com a skill.

---

## Como gerar um relatório

> Fluxo resumido. O passo a passo completo (extração do `.docx`, geração direta
> via ODBC do Data Warehouse, tabela de marcadores `{{...}}`) está no [CLAUDE.md](CLAUDE.md).

1. **Criar a pasta do dia** copiando o template inteiro (já traz CSS, JS e logo):
   ```powershell
   $slug = "noc-solucx-DDMMAAAA"
   $dst  = "Relatórios\$slug"
   New-Item -ItemType Directory -Force $dst
   Copy-Item "Relatórios\_template-noc\*" "$dst\" -Recurse -Force
   ```
2. **Preencher os dados** — substituir todos os marcadores `{{...}}` no `deck.html`.
3. **Lint:**
   ```bash
   bash ~/.claude/skills/decks-skill/scripts/lint.sh Relatórios/<slug>/deck.html
   ```
   Esperado **9/10** — o L10 é falso positivo no Windows (ausência de `python3`).
4. **Render do PDF:**
   ```powershell
   node "$HOME\.claude\skills\decks-skill\scripts\render-deck.js" `
     "Relatórios\<slug>\deck.html" --out "Relatórios\<slug>\<slug>.pdf"
   ```

> ⚠️ Antes de renderizar, confirme que não há marcadores `{{` no `deck.html` e que o
> `elven-deck.css` mantém as regras de layout — o painel de preview pode reverter edições.

---

## Padrão visual (locked no `_template-noc`)

- **Naming:** usar **"Command Center"**, nunca "NOC" (kicker, `<title>`, rodapés).
- **Logo:** `assets/elven-command-center.png` (lockup "elven COMMAND CENTER"), `.logo { width: 172px }`.
- **Rodapé (`.source`):** apenas o período do relatório (ex.: `24/06/2026`) — sem descrição por slide.
- **Sem** crédito "Gerado via Claude Code" em nenhum slide.
- **Gráfico de recorrência (slide 6):** verde `#34d399`.
- **CSS:** o `elven-deck.css` inclui `.score-grid` (gráfico + lateral), `.slide.vcenter` e os
  ajustes de `.matrix-row` para 3 colunas — sem elas os slides 4–7 estouram.

---

## Estrutura do deck (10 slides)

| # | Slide | Gráfico |
|---|-------|---------|
| 1 | Capa | — |
| 2 | Resumo executivo | — |
| 3 | Status dos eventos (dark) | — |
| 4 | Severidade | `chart-severidade` (red) |
| 5 | Volume de alertas | `chart-top-eventos` (teal) |
| 6 | Recorrência (dark) | `chart-recorrencia` (green `#34d399`) |
| 7 | Análise TTR prolongado | `chart-ttr` (red) |
| 8 | Tags e contexto operacional | — |
| 9 | Alertas críticos em aberto (dark) | — |
| 10 | Conclusão e próximos passos | — |
