---
name: feedback-odbc-python-queries
description: "Regras técnicas para executar queries ODBC via Python no Windows (pyodbc, PostgreSQL35W) e para a query C1 (SLA)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: be38439e-d237-4b2d-8cfc-c5c062d09c40
---

# ODBC Python — Regras Técnicas

## Regras obrigatórias

1. **Usar `?` como placeholder**, não `%s` — o driver PostgreSQL ODBC não suporta `%s`.
2. **Sempre usar aspas duplas nos nomes de tabela** com CamelCase — ex: `dbt_prd."fct__events"`, `dbt_prd."dim__eventsMetrics"`. Sem aspas, o PostgreSQL converte para minúsculas e a tabela não é encontrada.
3. **Nunca chamar Python via PowerShell inline com strings SQL** — o `||` do SQL entra em conflito com o parser do PowerShell. Sempre salvar o script em arquivo `.py` no scratchpad e executar `python <caminho>`.
4. **Usar `python`**, não `python3`, no Windows.
5. **SLA compliance (C1) usar `m.tta`, não `m.ttr`** — o plano `mtta6` é SLA de reconhecimento (MTTA). Filtrar `m.tta <= cc.sla_duration` e `m.is_ack = true`. Usar `m.ttr` dá resultado completamente errado (21.1% vs 98.7% real). Join em `dim__commandCenterClients` para obter `sla_duration`, não `dim__orgs`.

**Why:** Erros confirmados em sessão real:
- `%s` → `ProgrammingError: 0 parameter markers`
- Sem aspas → `relation "dbt_prd.dim__eventsmetrics" does not exist`
- `||` inline no PowerShell → parser error
- `m.ttr` no C1 → compliance 21.1% errado (correto era 98.7% com `m.tta`)

**How to apply:** Sempre que gerar script Python com queries ODBC, aplicar essas 5 regras antes de executar. A query corrigida está em `queries.md` (C1) nas 2 cópias da skill.
