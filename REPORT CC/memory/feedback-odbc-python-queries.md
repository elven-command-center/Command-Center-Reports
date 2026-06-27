---
name: feedback-odbc-python-queries
description: "Regras técnicas para executar queries ODBC via Python no Windows (pyodbc, PostgreSQL35W)"
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

**Why:** Erros confirmados em sessão real:
- `%s` → `ProgrammingError: 0 parameter markers`
- Sem aspas → `relation "dbt_prd.dim__eventsmetrics" does not exist`
- `||` inline no PowerShell → parser error

**How to apply:** Sempre que gerar script Python com queries ODBC, aplicar essas 4 regras antes de executar.
