---
name: analise-dados-cc
description: Gera relatórios analíticos em PDF (deck visual estilo Elven Command Center) para clientes monitorados, consultando dados diretamente do banco PostgreSQL via ODBC (schema dbt_prd, database data_warehouse). Use esta skill sempre que o usuário pedir "análise", "relatório", "relatório do cliente X", "gera o relatório", "quero ver os dados de", ou qualquer combinação envolvendo cliente + período + métricas do Command Center — mesmo que não cite explicitamente "análise" ou "PDF".
---

# Análise de Dados — Command Center

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

**3. Catálogo de informações — o que incluir no relatório?**
Liste as opções disponíveis em `references/catalog.md`. Sempre ofereça a opção `0. Seguir padrão` primeiro.
O usuário pode escolher `0` (padrão) ou adicionar extras numerados (ex: `0, 3, 7`).

Só depois das três respostas, inicie o processo de geração.

---

## Conexão ODBC

```python
import pyodbc

conn = pyodbc.connect('DSN=PostgreSQL35W;Database=data_warehouse', timeout=30)
cursor = conn.cursor()
```

Todas as queries usam o schema `dbt_prd`. Filtre sempre por `org_uid` e pelo período informado.
As queries de referência estão em `references/queries.md`.

---

## Processo de geração

### 1. Montar e executar as queries

Leia `references/queries.md` e selecione as queries correspondentes às métricas escolhidas (padrão + extras do catálogo).

Para cada query:
- Substitua `{org_uid}` pelo uid do cliente
- Substitua `{date_start}` e `{date_end}` pelo período (formato: `YYYY-MM-DD`)
- Execute e colete os resultados

### 2. Criar a pasta do relatório

```powershell
$slug = "cc-{cliente}-{DDMMAAAA}"
$base = "C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\CLIENTES CROSS\Relatórios"
$dst  = "$base\$slug"
New-Item -ItemType Directory -Force $dst
New-Item -ItemType Directory -Force "$dst\assets"
Copy-Item "$base\_template-noc\*" "$dst\" -Recurse -Force
```

### 3. Preencher o deck.html

Substitua os marcadores `{{...}}` no `deck.html` copiado do template com os dados coletados.
Os marcadores disponíveis por slide estão documentados no `CLAUDE.md` do projeto CLIENTES CROSS.

Para slides extras (catálogo adicional), adicione slides após os slides padrão usando o padrão visual do template.

### 4. Gerar o PDF

```powershell
node "C:\Users\PC\.claude\skills\decks-skill\scripts\render-deck.js" `
  "$dst\deck.html" `
  --out "$dst\$slug.pdf"
```

### 5. Apresentar ao usuário

Informe o caminho do PDF gerado e pergunte se há ajustes ou se deseja adicionar mais itens do catálogo.

---

## Boas práticas

- Use `python` (não `python3`) no Windows
- Sempre formate números com separador de milhar (ex: `1.351`)
- MTTR e MTTA no formato `HH:MM:SS`; use `N/A` quando não houver dados
- Aplique o branding Elven Command Center (nunca "NOC") — ver template em `_template-noc`
- Se o usuário não souber o período exato, sugira "ontem" ou "últimos 7 dias" como padrão
- Mantenha os dados sensíveis (org_uid) apenas nos filtros SQL, nunca exiba no relatório

---

## Arquivos de referência

- `references/catalog.md` — catálogo de métricas (padrão + extras); **você pode editar este arquivo** para ajustar o que entra no relatório padrão
- `references/queries.md` — queries SQL por métrica; **você pode editar** para ajustar filtros e cálculos
- `references/schemas.md` — mapa das tabelas do dbt_prd para consulta rápida
