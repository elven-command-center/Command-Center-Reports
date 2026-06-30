# REPORT CC — Relatórios do Command Center

Geração de relatórios operacionais do **Command Center** da Elven Works em
deck visual (16:9, em PDF), um por cliente e período.

---

## Estrutura do projeto

```text
REPORT CC/
├── Relatórios/                  — entrega final, uma pasta por relatório
│   ├── _template-noc/           — template base (CSS, JS e assets)
│   └── cc-{cliente}-{periodo}/  — deck.html + PDF gerado
├── skills/                      — skills de geração usadas pelo Claude Code
│   ├── decks-skill/             — montagem, lint e render dos decks
│   ├── elven-cc-data-analysis/  — relatório analítico a partir dos dados
│   └── elven-cc-additional-information/  — análise do campo de atendimento
├── memory/                      — memória do projeto (fluxo, padrões)
└── README.md                    — este arquivo
```

---

## Fonte de dados

As métricas vêm do Data Warehouse (PostgreSQL), consultado via ODBC.
As credenciais de acesso **não ficam no repositório** — são lidas de variáveis
de ambiente / cofre de segredos no momento da execução.

---

## Fluxo de geração

1. Definir **data**, **cliente** e **catálogo** do relatório.
2. Coletar as métricas do período no Data Warehouse.
3. Criar a pasta `Relatórios/cc-{cliente}-{periodo}/` e copiar os assets do `_template-noc/`.
4. Preencher o `deck.html` com os dados reais.
5. Renderizar o PDF com a skill de decks.
6. Entregar o PDF na pasta do relatório.

---

## Padrão de nomenclatura

```text
Data única:  cc-{cliente}-{DDMMAAAA}        ex: cc-unicred-28062026
Período:     cc-{cliente}-{DD}a{DDMMAAAA}   ex: cc-kontik-26a30062026
```

- Título do deck: **"Command Center - Relatório Operacional"**
- Texto sempre com hífen (`-`), nunca travessão (`—`)
- Cada relatório fica em sua própria pasta dentro de `Relatórios/`

---

## Skills

| Skill | Função |
| --- | --- |
| `decks-skill` | Monta, valida (lint) e renderiza os decks no padrão visual Elven. |
| `elven-cc-data-analysis` | Gera o relatório analítico em PDF a partir dos dados. |
| `elven-cc-additional-information` | Analisa o campo de atendimento e gera insights. |
