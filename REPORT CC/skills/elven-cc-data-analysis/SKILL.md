---
name: elven-cc-data-analysis
description: Gera relatórios analíticos em PDF (deck visual estilo Elven Command Center) para clientes monitorados, consultando dados diretamente do banco PostgreSQL via ODBC (schema dbt_prd, database data_warehouse). Use esta skill sempre que o usuário pedir "análise", "relatório", "relatório do cliente X", "gera o relatório", "quero ver os dados de", ou qualquer combinação envolvendo cliente + período + métricas do Command Center - mesmo que não cite explicitamente "análise" ou "PDF".
---

# Análise de Dados - Command Center

Skill para gerar relatórios analíticos visuais em PDF para clientes do Command Center, com dados extraídos do Data Warehouse via ODBC.

## Fluxo obrigatório ao iniciar

Antes de qualquer consulta ou geração, sempre faça as três perguntas **em sequência, uma por vez**:

**1. Qual a data (ou período)?**
Aceita: data única (`25/06/2026`), período (`01/06 a 25/06`) ou referência relativa (`ontem`, `semana passada`).

**2. Qual o cliente?**
Leia os clientes de `references/orgs.json` (incluído na skill) e liste-os numerados, sem bullet points:
```
1. Onfly
2. Elven observability
3. Dotz
... (todos os clientes do arquivo)
```
O usuário responde com o número ou o nome. Use o `org_uid` correspondente nos filtros SQL.

**3. Catálogo de informações - o que incluir no relatório?**
Liste as opções disponíveis em `references/catalog.md`. Sempre ofereça a opção `0. Seguir padrão` primeiro.
O usuário pode escolher `0` (padrão) ou adicionar extras numerados (ex: `0, 3, 7`).

Só depois das três respostas, inicie o processo de geração.

---

## Processo de geração

### 1. Executar as queries (script pronto - NÃO reescrever)

**Use o script parametrizado `scripts/cc_report.py`** - ele já contém P1..P11 + catálogo, com o
filtro padrão de responder embutido e saída compacta (economiza tokens). **Não leia `queries.md`
nem monte um script novo** salvo se precisar editar/depurar uma query específica.

```powershell
python "C:\Users\PC\.claude\skills\elven-cc-data-analysis\scripts\cc_report.py" `
  --org <org_uid> --start AAAA-MM-DD --end AAAA-MM-DD [--catalog 5,7] [--all-teams]
```

- `--catalog` recebe os números do catálogo extra (1=SLA, 2=IA, 3=Runbook, 5=Lista detalhada,
  7=Tendência, 8=Horário, 9=Canais, 10=Times). Omita para só o padrão.
- `--all-teams` remove o filtro de responder; **sem essa flag**, o script já filtra apenas
  **"Time NOC - Elven"** (casa por nome do time + org_uid, pois o `team_id` muda por cliente).
- A saída é uma linha por métrica (`Pn_x: col=val ...`) e listas pipe-delimitadas - leia direto.

`references/queries.md` continua sendo a fonte das queries para consulta/edição pontual; o
script é a forma padrão de executar. Conexão: `DSN=PostgreSQL35W;Database=data_warehouse`, schema `dbt_prd`.

### 2. Criar a pasta do relatório

```powershell
# slug: data única -> cc-{cliente}-{DDMMAAAA}; período -> cc-{cliente}-{DDaDDMMAAAA}
$slug = "cc-{cliente}-{DDMMAAAA}"
$base = "C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\REPORT CC\Relatórios"
$dst  = "$base\$slug"
New-Item -ItemType Directory -Force $dst
# _template-noc já traz assets/, elven-deck.css e elven-deck-charts.js (fonte estável)
Copy-Item "$base\_template-noc\*" "$dst\" -Recurse -Force
```

### 3. Preencher o deck.html

Use como base de layout o `deck.html` de um relatório **recente do mesmo perfil** (ex: outro
relatório CC) e adapte os dados. CSS e JS de gráficos já vêm do `_template-noc` - não precisa
recriá-los. Para slides extras (catálogo adicional), adicione slides após os padrão reusando as
classes existentes (`.matrix`, `.score-grid`, `.evidence-row.stack`, etc.) - nunca estilo inline.

### 4. Gerar o PDF

```powershell
node "C:\Users\PC\.claude\skills\decks-skill\scripts\render-deck.js" `
  "$dst\deck.html" `
  --out "$dst\$slug.pdf"
```

### 5. Apresentar ao usuário

Informe o caminho do PDF gerado e um resumo curto dos números. **Não** pergunte se há ajustes
nem ofereça mais itens do catálogo (o usuário pede extras quando quiser).

---

## Boas práticas

- Use `python` (não `python3`) no Windows
- Sempre formate números com separador de milhar (ex: `1.351`)
- MTTR e MTTA no formato `HH:MM:SS`; use `N/A` quando não houver dados
- Aplique o branding Elven Command Center (nunca "NOC") - ver template em `_template-noc`
- Se o usuário não souber o período exato, sugira "ontem" ou "últimos 7 dias" como padrão
- Mantenha os dados sensíveis (org_uid) apenas nos filtros SQL, nunca exiba no relatório

---

## Arquivos de referência

- `scripts/cc_report.py` - **executa todas as queries de uma vez** (padrão + catálogo) com saída compacta. Forma padrão de coletar dados; edite-o se mudar uma query.
- `references/catalog.md` - catálogo de métricas (padrão + extras); **você pode editar este arquivo** para ajustar o que entra no relatório padrão
- `references/queries.md` - queries SQL por métrica (fonte/consulta pontual); manter em sincronia com `cc_report.py` ao alterar uma query
- `references/schemas.md` - mapa das tabelas do dbt_prd para consulta rápida

> Token-saving: não leia `queries.md` no fluxo normal - rode `cc_report.py`. Não releia decks inteiros sem necessidade; reaproveite as classes CSS do `_template-noc`.
