# Command Center — Elven Works

Repositório de monitoramento operacional e geração de relatórios periódicos
(decks 16:9 em PDF, padrão visual Elven Works) do Command Center.

---

## Estrutura — 2 projetos

Cada pasta é um projeto independente e autossuficiente, com seu próprio
`README.md`, template de deck e histórico de relatórios:

| Pasta | Conteúdo |
| --- | --- |
| [`COMMAND CENTER/`](COMMAND%20CENTER/) | Relatórios NOC multi-cliente e o código-fonte da skill de decks (`elven-decks-main`). |
| [`REPORT CC/`](REPORT%20CC/) | Relatórios analíticos por cliente, gerados via skills a partir do Data Warehouse. |

```text
COMMAND CENTER/
├── COMMAND CENTER/   — relatórios NOC multi-cliente + skill de decks
├── REPORT CC/        — relatórios analíticos por cliente
└── README.md         — este arquivo
```

---

## Como cada projeto funciona

Os dois projetos seguem o mesmo padrão:

- `Relatórios/` — um deck por período, mais o `_template-noc/` (template canônico).
- `skills/` ou `elven-decks-main/` — skills de geração e render dos decks.
- `README.md` — visão geral e fluxo do projeto.

As métricas vêm do Data Warehouse (PostgreSQL). As credenciais de acesso
**não ficam no repositório** — são lidas de variáveis de ambiente / cofre de
segredos no momento da execução.

> O passo a passo completo de cada projeto (coleta de dados, marcadores do
> template, lint e render do PDF) está no `README.md` da respectiva pasta.
