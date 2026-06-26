# Command Center — Elven Works

Repositório de monitoramento operacional e geração de relatórios periódicos
(decks 16:9 em PDF, padrão visual Elven Works) para os clientes do Command Center.

---

## Estrutura — 3 pastas, cada uma de um cliente diferente

Cada pasta é um projeto independente e autossuficiente (com seu próprio
`CLAUDE.md`, `README.md`, template de deck e histórico de relatórios), aplicado
a um cliente distinto:

| Pasta | Cliente |
|---|---|
| [`BLIP/`](BLIP/) | **Blip** — monitoramento NOC via Power BI e relatórios periódicos do Command Center. |
| [`COMMAND CENTER/`](COMMAND%20CENTER/) | **Command Center** — operação interna / padrão de referência. |
| [`KONTIK/`](KONTIK/) | **Kontik** — relatórios de eventos e decks do cliente Kontik. |

```
COMMAND CENTER/
├── BLIP/             — cliente Blip
├── COMMAND CENTER/   — cliente Command Center (interno / referência)
├── KONTIK/           — cliente Kontik
└── README.md         — este arquivo
```

---

## Como cada projeto funciona

Todas as pastas seguem o mesmo padrão:

- `Dashboard/` ou fonte de dados (Power BI / Data Warehouse) com as métricas do dia.
- `Relatórios/` — um deck por dia, mais o `_template-noc/` (template canônico).
- `elven-decks-main/` — código-fonte da skill de geração de decks.
- `CLAUDE.md` — instruções operacionais detalhadas do cliente.
- `setup-skill.ps1` — verifica/instala a skill de decks.

> O passo a passo completo de cada cliente (extração de dados, marcadores do
> template, lint e render do PDF) está no `README.md` e no `CLAUDE.md` da
> respectiva pasta.
