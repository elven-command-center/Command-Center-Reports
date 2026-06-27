---
name: elven-cc-additional-information
description: |
  Analisa o campo additional_information do banco PostgreSQL (dbt_prd) via ODBC para identificar padroes de atendimento e gerar um relatorio PDF com insights, categorias e percentuais. Use esta skill sempre que o usuario pedir analise de atendimento, padroes de chamados, relatorio de additional_information, qualidade do preenchimento de registros, ou quiser entender o que foi feito nos atendimentos. Se o usuario falar em "analisar atendimentos", "ver padroes", "relatorio de chamados", "padroes de atendimento" ou "o que os atendentes estao registrando", acione esta skill imediatamente. Ao acionar a skill, inicie o fluxo de coleta de parametros IMEDIATAMENTE — nao espere o usuario escrever mais nada.
---

# Skill: Analise de Padroes de Atendimento

## Comportamento ao ser acionada

Assim que esta skill for invocada, **inicie imediatamente** o fluxo de coleta de parametros abaixo. Nao espere o usuario escrever mais nada, nao faca introducoes longas. Apresente as perguntas de forma direta e objetiva.

---

## Passo 0 — Iniciar o fluxo de parametros (executar imediatamente ao acionar a skill)

Apresente as 3 perguntas de uma vez, formatadas claramente:

---

**Para gerar o relatorio de atendimento, preciso de algumas informacoes:**

**1. Periodo**
Qual intervalo de datas voce quer analisar?
- Ultimos 7 dias
- Ultimos 30 dias
- Ultimos 90 dias
- Periodo personalizado (informe data inicio e fim)

**2. Cliente**
Filtrar por cliente especifico ou analisar todos?

Clientes disponiveis:
> Onfly / Elven observability / Dotz / Cogtive / Conta Azul / Elven Works / Grupo Irrah / 1sTi / JCA / MultiClubes / Radar E-commerce / Sleep up / TotalPass / Trillia / Vortx / Solucx / **Todos**

**3. Tipo de analise**
1. Qualidade de preenchimento
2. Categorias de acao
3. Analise completa (qualidade + categorias + runbook + exemplos + recomendacoes)
4. Padroes por cliente
5. Padroes por atendente

---

Aguarde as respostas e confirme antes de prosseguir.

---

## Arquivo de referencia de clientes

Leia `references/orgs.json` para resolver org_uid a partir do nome escolhido. Use o `org_uid` no filtro da query — nunca filtre pelo campo `org_name` do banco.

---

## Passo 1 — Conectar via ODBC

```python
import pyodbc, json

with open('references/orgs.json', encoding='utf-8') as f:
    orgs_list = json.load(f)['orgs']
orgs_by_name = {o['org_name'].lower(): o['org_uid'] for o in orgs_list}

conn = pyodbc.connect("DSN=PostgreSQL35W")
```

---

## Passo 2 — Coletar os dados com os filtros aplicados

```sql
SELECT
    e.event_type,
    e.org_uid,
    e.org_name,
    e.severity,
    e.last_status,
    e.has_runbook,
    e.runbook_type,
    e.additional_information::text AS info,
    e.event_detected_tzbr
FROM "dbt_prd"."dsh__events_noc_investigation" e
WHERE e.additional_information IS NOT NULL
  AND e.additional_information::text NOT IN ('{}', '{NULL}')
  AND e.event_detected_tzbr BETWEEN '<data_inicio>' AND '<data_fim>'
  -- Se cliente especifico:
  AND e.org_uid = '<org_uid_do_orgs_json>'
ORDER BY e.event_detected_tzbr DESC
LIMIT 2000
```

Se "Todos" foi escolhido, remova o filtro de org_uid.

---

## Passo 3 — Classificar runbook (Operator vs CCO)

```python
def classify_runbook(row):
    if not row['has_runbook']:
        return 'Sem runbook'
    tipo = (row['runbook_type'] or '').lower().strip()
    if 'operator' in tipo:
        return 'Runbook via Operator'
    elif 'cco' in tipo:
        return 'Runbook via CCO'
    elif tipo:
        return f'Runbook - {tipo}'
    return 'Runbook (tipo nao identificado)'
```

Inclua no relatorio:
- Total com runbook vs sem runbook (% e contagem)
- Breakdown: Operator | CCO | nao identificado
- Cruzamento: qualidade do preenchimento em eventos com runbook vs sem runbook

---

## Passo 4 — Classificar qualidade e categorias

### Qualidade

| Classificacao | Criterio |
|---|---|
| **Adequado** | Descreve acao realizada, canal ou resultado |
| **Incompleto** | Menciona situacao mas nao a acao tomada |
| **Generico** | Texto padrao sem valor ("ok", "ciente", "verificado") |
| **Vazio** | Irrelevante ou menos de 15 caracteres |

### Categorias

- Comunicacao via canal (WhatsApp, Discord, Slack, telefone)
- Resolucao / normalizacao
- Escalacao / acionamento de oncall
- Runbook / procedimento seguido
- Monitoramento / aguardo
- Configuracao / setup
- Interacao com cliente
- Outros

---

## Passo 5 — Gerar o relatorio PDF

Use `reportlab`. Se nao instalado: `pip install reportlab`.

```
CAPA
  - Titulo: Analise de Padroes de Atendimento
  - Cliente: <nome do orgs.json ou "Todos">
  - Periodo: <data_inicio> a <data_fim>
  - Tipo: <escolhido>
  - Total analisado: N registros

SECAO 1 — Qualidade de Preenchimento
SECAO 2 — Execucao de Runbook (Operator vs CCO)
SECAO 3 — Categorias de Atendimento
SECAO 4 — Exemplos Reais (bons em verde, ruins em laranja/vermelho)
SECAO 5 — Recomendacoes + Template sugerido
```

Nome do arquivo: `relatorio_atendimento_<cliente>_<YYYYMMDD>.pdf`

---

## Tratamento de situacoes especiais

| Situacao | O que fazer |
|---|---|
| org_uid nao encontrado no orgs.json | Usar org_name do banco como fallback |
| Periodo sem registros | Avisar e sugerir ampliar o intervalo |
| Poucos registros (<50) | Avisar que a amostra pode nao ser representativa |
| runbook_type sempre nulo | Informar no relatorio que o tipo nao esta sendo registrado |
| `reportlab` nao instalado | Instalar automaticamente |

---

## Notas

- Nunca exibir senhas — a conexao ODBC ja abstrai isso.
- Sempre resolver o nome do cliente via orgs.json usando o org_uid.
- O relatorio deve ser legivel por um gestor sem contexto tecnico.
