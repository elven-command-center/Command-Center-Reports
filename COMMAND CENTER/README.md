# Command Center — NOC Multi-cliente

Monitoramento operacional consolidado da **Elven Works** com geração de decks
visuais (16:9, em PDF) por período.

---

## Estrutura do projeto

```
COMMAND CENTER/
├── Relatórios/
│   ├── _template-noc/              — template base para novos decks
│   └── noc-multicliente-DDMMAAAA/  — um deck por período
├── elven-decks-main/              — código-fonte da skill de decks
├── CLAUDE.md                      — instruções do projeto
├── README.md                      — este arquivo
└── setup-skill.ps1                — verifica/instala a skill de decks
```

---

## Fonte de dados

Os dados vêm do Data Warehouse (PostgreSQL). As credenciais de acesso
(host, usuário e senha) **não ficam no repositório** — são lidas de variáveis
de ambiente / cofre de segredos no momento da execução.

---

## Workflow — gerar deck para um novo período

1. **Coletar os dados** do período no Data Warehouse.
2. **Criar a pasta** do período e copiar os assets do `_template-noc/`.
3. **Editar o `deck.html`** substituindo os marcadores `{{...}}` pelos dados reais.
4. **Renderizar o PDF** com a skill de decks.

> O passo a passo detalhado está no `CLAUDE.md`.

---

## Skill de geração de decks

- **Fonte:** `elven-decks-main/skill/`
- **Verificar/reinstalar:** `.\setup-skill.ps1`

---

## Padrão de nomenclatura

- Título do deck: **"Command Center Multi-cliente"**
- Pasta: `Relatórios/noc-multicliente-DDMMAAAA/`
- PDF: `noc-multicliente-DDMMAAAA.pdf`
