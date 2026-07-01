# Queries SQL - Command Center Analytics

Todas as queries usam `database=data_warehouse`, `schema=dbt_prd`.
Substitua os placeholders antes de executar:
- `{org_uid}` → uid do cliente (de orgs.json)
- `{date_start}` → data início no formato `YYYY-MM-DD`
- `{date_end}` → data fim no formato `YYYY-MM-DD` (inclusive)
- `{resp_filter}` → filtro padrão do responder (ver abaixo) - **sempre aplicado**

---

## FILTRO PADRÃO OBRIGATÓRIO - Responder = Time NOC - Elven

Por padrão, **todo relatório considera apenas eventos atendidos pelo time "Time NOC - Elven"**
do cliente. Esse filtro (`{resp_filter}`) já está embutido no `WHERE` de todas as queries abaixo
e deve ser sempre aplicado, salvo se o usuário pedir explicitamente o contrário (ex: "todos os
times", "sem filtro de responder").

O nome do time é o mesmo em todos os clientes, mas o `team_id` muda por org - por isso o filtro
casa por **nome do time + org_uid** (a coluna `team_name` pode ter espaço sobrando → usar `TRIM`):

```sql
-- {resp_filter}  (sempre depende do alias `e` = dbt_prd."fct__events")
  AND EXISTS (
    SELECT 1
    FROM dbt_prd."dim__eventsResponders" r
    JOIN dbt_prd."dim__teams" t ON t.team_id::text = r.responder_uid
    WHERE r.event_id = e.event_id
      AND r.event_type = e.event_type
      AND r.deleted_at IS NULL
      AND r.responder_type = 'teams'
      AND TRIM(t.team_name) = 'Time NOC - Elven'
      AND t.org_uid = '{org_uid}'
  )
```

> Para gerar o relatório **sem** o filtro (visão de todos os times), basta substituir
> `{resp_filter}` por string vazia.

**Alternativa para queries ad-hoc (sem JOIN):** a view `dbt_prd.dsh__events_noc_investigation` já traz
o array `responder_names` por evento - dá pra filtrar direto com `'Time NOC - Elven' = ANY(responder_names)`
em vez do EXISTS acima. **Só usar com `AND is_deleted = '0'` junto** - essa view não exclui eventos
deletados sozinha (`is_deleted` é uma coluna própria, texto `'0'`/`'1'`, diferente do `deleted_at` de
`fct__events`). Sem esse filtro o total vem inflado com eventos deletados. Ver `schemas.md` para mais
colunas dessa view (`tags` também vem em array, dá pra filtrar sem JOIN em `dim__eventsTags`).

---

## P1 - Volume total de alertas

```sql
SELECT COUNT(*) AS total_eventos
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter};
```

---

## P2 - MTTR médio

```sql
SELECT
  AVG(m.ttr) AS mttr_segundos,
  TO_CHAR((AVG(m.ttr) || ' seconds')::interval, 'HH24:MI:SS') AS mttr_formatado
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND m.is_resolved = true
  AND e.deleted_at IS NULL
  {resp_filter};
```

---

## P3 - MTTA médio

```sql
SELECT
  AVG(m.tta) AS mtta_segundos,
  TO_CHAR((AVG(m.tta) || ' seconds')::interval, 'HH24:MI:SS') AS mtta_formatado,
  COUNT(*) FILTER (WHERE m.is_ack = true) AS total_com_ack
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND m.is_ack = true
  AND e.deleted_at IS NULL
  {resp_filter};
```

---

## P4 - Taxa de resolução

```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE m.is_resolved = true) AS resolvidos,
  ROUND(
    COUNT(*) FILTER (WHERE m.is_resolved = true)::numeric / NULLIF(COUNT(*), 0) * 100, 1
  ) AS taxa_resolucao_pct
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter};
```

---

## P5 - Status dos eventos (matrix ACK × Resolução)

```sql
SELECT
  COUNT(*) FILTER (WHERE m.is_ack = true  AND m.is_resolved = true)  AS ack_resolvido,
  COUNT(*) FILTER (WHERE m.is_ack = false AND m.is_resolved = true)  AS resolvido_sem_ack,
  COUNT(*) FILTER (WHERE m.is_ack = true  AND m.is_resolved = false) AS ack_sem_resolucao,
  COUNT(*) FILTER (WHERE m.is_ack = false AND m.is_resolved = false) AS sem_ack_sem_res,
  COUNT(*) AS total
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter};
```

---

## P6 - Distribuição por severidade + TTR prolongado

> **Atenção:** os valores reais da coluna `severity` são `sev-1-critical` e `sev-2-high`
> (e eventualmente `NULL`/outros). NÃO use o literal `'sev1'`.

```sql
-- Severidade (distribuição real)
SELECT
  COUNT(*) FILTER (WHERE e.severity = 'sev-1-critical') AS sev1_critical_qtd,
  COUNT(*) FILTER (WHERE e.severity = 'sev-2-high')     AS sev2_high_qtd,
  COUNT(*) FILTER (WHERE e.severity NOT IN ('sev-1-critical','sev-2-high')
                        OR e.severity IS NULL)          AS outros_qtd,
  COUNT(*) AS total
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter};

-- Distribuição detalhada por valor de severity (sanity check)
SELECT e.severity, COUNT(*) AS qtd
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.severity
ORDER BY qtd DESC;

-- TTR > 30 min (1800 segundos)
SELECT
  COUNT(*) AS ttr30_qtd,
  MAX(m.ttr) AS ttr_max_segundos,
  TO_CHAR((MAX(m.ttr) || ' seconds')::interval, 'HH24:MI:SS') AS ttr_max_formatado
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND m.ttr > 1800
  AND m.is_resolved = true
  AND e.deleted_at IS NULL
  {resp_filter};
```

---

## P7 - Top 5 alertas por volume

```sql
SELECT
  e.title,
  COUNT(*) AS qtd
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.title
ORDER BY qtd DESC
LIMIT 5;
```

---

## P8 - Top 5 alertas recorrentes (dias distintos)

```sql
SELECT
  e.title,
  COUNT(DISTINCT e.event_happened_tzbr::date) AS dias_distintos,
  COUNT(*) AS total_disparos,
  e.severity,
  TO_CHAR((AVG(m.ttr) || ' seconds')::interval, 'HH24:MI:SS') AS ttr_medio
FROM dbt_prd.fct__events e
LEFT JOIN dbt_prd.dim__eventsMetrics m ON m.event_id = e.event_id AND m.event_type = e.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.title, e.severity
HAVING COUNT(DISTINCT e.event_happened_tzbr::date) > 1
ORDER BY dias_distintos DESC, total_disparos DESC
LIMIT 5;
```

---

## P9 - Top 5 TTR prolongado (>30min)

```sql
SELECT
  e.title,
  COUNT(*) AS qtd_ttr_longo,
  TO_CHAR((MAX(m.ttr) || ' seconds')::interval, 'HH24:MI:SS') AS ttr_max
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND m.ttr > 1800
  AND m.is_resolved = true
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.title
ORDER BY qtd_ttr_longo DESC
LIMIT 5;
```

---

## P10 - Distribuição por tags

```sql
SELECT
  t.tag,
  COUNT(*) AS qtd,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 1) AS pct
FROM dbt_prd.dim__eventsTags t
JOIN dbt_prd.fct__events e ON e.event_id = t.event_id AND e.event_type = t.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  AND t.deleted_at IS NULL
  {resp_filter}
GROUP BY t.tag
ORDER BY qtd DESC
LIMIT 10;
```

---

## P11 - Alertas críticos em aberto

```sql
SELECT
  e.title,
  e.severity,
  TO_CHAR((m.ttr || ' seconds')::interval, 'HH24:MI:SS') AS ttr_acumulado,
  e.cause AS servico_cluster
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND m.is_resolved = false
  AND e.deleted_at IS NULL
  {resp_filter}
ORDER BY m.ttr DESC NULLS LAST
LIMIT 5;
```

---

## C1 - SLA (catálogo adicional)

```sql
-- Compliance MTTA: % eventos reconhecidos dentro da janela SLA do plano
-- SLA é de reconhecimento (TTA), não de resolução (TTR)
-- Fonte do sla_duration: dim__commandCenterClients (não dim__orgs)
SELECT
  cc.sla_duration,
  cc.plan_name,
  COUNT(*) AS total_com_ack,
  COUNT(*) FILTER (WHERE m.tta <= cc.sla_duration) AS dentro_sla,
  COUNT(*) FILTER (WHERE m.tta > cc.sla_duration)  AS fora_sla,
  ROUND(COUNT(*) FILTER (WHERE m.tta <= cc.sla_duration)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS compliance_pct
FROM dbt_prd."dim__eventsMetrics" m
JOIN dbt_prd."fct__events" e ON e.event_id = m.event_id AND e.event_type = m.event_type
JOIN dbt_prd."dim__commandCenterClients" cc ON cc.org_uid = e.org_uid
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND m.is_ack = true
  AND e.deleted_at IS NULL
  AND cc.deleted_at IS NULL
  {resp_filter}
GROUP BY cc.sla_duration, cc.plan_name;
```

---

## C5 - Lista detalhada de eventos (catálogo adicional)

> **Formato do slide (padrão):** agrupar por **data + título**, com a **data em primeiro lugar
> no padrão brasileiro (DD/MM/AAAA)**, seguida de **Título, Qtd, TTA médio e TTR médio**.
> NÃO incluir colunas de severidade, ACK nem Resolvido. Limitar a ~18 linhas para caber no
> slide 16:9 sem estourar (mais que isso, cortar por dia inteiro ou reduzir o período).

```sql
SELECT
  TO_CHAR(e.event_happened_tzbr::date, 'DD/MM/YYYY') AS data,
  e.title,
  COUNT(*) AS qtd,
  TO_CHAR((AVG(m.tta) || ' seconds')::interval, 'HH24:MI:SS') AS tta_medio,
  TO_CHAR((AVG(m.ttr) || ' seconds')::interval, 'HH24:MI:SS') AS ttr_medio
FROM dbt_prd."fct__events" e
LEFT JOIN dbt_prd."dim__eventsMetrics" m ON m.event_id = e.event_id AND m.event_type = e.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.event_happened_tzbr::date, e.title
ORDER BY e.event_happened_tzbr::date DESC, qtd DESC
LIMIT 18;
```

---

## C2 - IA (catálogo adicional)

```sql
SELECT
  COUNT(*) FILTER (WHERE e.ai_touched = true) AS eventos_ia,
  COUNT(*) AS total,
  ROUND(COUNT(*) FILTER (WHERE e.ai_touched = true)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS pct_ia,
  e.ai_execution_status,
  COUNT(*) AS qtd_por_status
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.ai_execution_status;
```

---

## C3 - Runbook (catálogo adicional)

```sql
SELECT
  COUNT(*) FILTER (WHERE cc.has_runbook = true) AS com_runbook,
  COUNT(*) AS total,
  ROUND(COUNT(*) FILTER (WHERE cc.has_runbook = true)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS cobertura_pct,
  cc.runbook_type,
  COUNT(*) AS qtd_por_tipo
FROM dbt_prd.dim__eventsCommandCenter cc
JOIN dbt_prd.fct__events e ON e.event_id = cc.event_id AND e.event_type = cc.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY cc.runbook_type;
```

---

## C7 - Tendência de volume 30 dias (catálogo adicional)

```sql
SELECT
  e.event_happened_tzbr::date AS dia,
  COUNT(*) AS qtd
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date >= ('{date_end}'::date - INTERVAL '30 days')
  AND e.event_happened_tzbr::date <= '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY dia
ORDER BY dia;
```

---

## C8 - Distribuição por horário (catálogo adicional)

```sql
SELECT
  e.event_time_cluster_tzbr AS cluster_horario,
  COUNT(*) AS qtd,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 1) AS pct
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.event_time_cluster_tzbr
ORDER BY qtd DESC;
```

---

## C9 - Canais de notificação (catálogo adicional)

```sql
SELECT
  UNNEST(cc.channels) AS canal,
  COUNT(*) AS qtd
FROM dbt_prd.dim__eventsCommandCenter cc
JOIN dbt_prd.fct__events e ON e.event_id = cc.event_id AND e.event_type = cc.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY canal
ORDER BY qtd DESC;
```

---

## C11 - UNICRED - Eventos críticos (catálogo adicional, específico Unicred)

> As tags reais no banco seguem o padrão `Acionamento: <NOME>` (maiúsculas) - os nomes
> informados pelo usuário (`ti_processamento`, `ti_pix`, `ti_inf_datacenter_network`,
> `ti_sup_cobranca`) foram conferidos contra `dim__eventsTags` e mapeados para:
> - `Acionamento: TI_PROCESSAMENTO`
> - `Acionamento: TI_PIX`
> - `time: pix` (tag literal, categoria diferente de "Acionamento")
> - `Acionamento: TI_INF_DATACENTER_NETWORK`
> - `Acionamento: TI_SUP_COBRANCA`

```sql
-- Resumo por tag
SELECT
  t.tag,
  COUNT(DISTINCT e.event_id) AS qtd
FROM dbt_prd."dim__eventsTags" t
JOIN dbt_prd."fct__events" e ON e.event_id = t.event_id AND e.event_type = t.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  AND t.deleted_at IS NULL
  AND t.tag IN ('Acionamento: TI_PROCESSAMENTO', 'Acionamento: TI_PIX', 'time: pix',
                 'Acionamento: TI_INF_DATACENTER_NETWORK', 'Acionamento: TI_SUP_COBRANCA')
  {resp_filter}
GROUP BY t.tag
ORDER BY qtd DESC;

-- Lista detalhada (agrupada por data+título, igual padrão C5, + severidade e tag(s) que casaram)
SELECT
  TO_CHAR(e.event_happened_tzbr::date, 'DD/MM/YYYY') AS data,
  e.title,
  e.severity,
  STRING_AGG(DISTINCT t.tag, ', ') AS tags_match,
  COUNT(DISTINCT e.event_id) AS qtd,
  TO_CHAR((AVG(m.ttr) || ' seconds')::interval, 'HH24:MI:SS') AS ttr_medio
FROM dbt_prd."fct__events" e
JOIN dbt_prd."dim__eventsTags" t ON t.event_id = e.event_id AND t.event_type = e.event_type
  AND t.deleted_at IS NULL
  AND t.tag IN ('Acionamento: TI_PROCESSAMENTO', 'Acionamento: TI_PIX', 'time: pix',
                 'Acionamento: TI_INF_DATACENTER_NETWORK', 'Acionamento: TI_SUP_COBRANCA')
LEFT JOIN dbt_prd."dim__eventsMetrics" m ON m.event_id = e.event_id AND m.event_type = e.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  {resp_filter}
GROUP BY e.event_happened_tzbr::date, e.title, e.severity
ORDER BY e.event_happened_tzbr::date DESC, qtd DESC
LIMIT 18;
```

---

## C10 - Times respondedores (catálogo adicional)

> Com o filtro padrão ativo, o resultado tende a destacar o próprio Time NOC - Elven.
> Para ver a divisão entre todos os times do cliente, rode esta query SEM `{resp_filter}`.

```sql
SELECT
  r.responder_type,
  r.responder_uid,
  COALESCE(t.team_name, r.responder_uid) AS responder_nome,
  COUNT(DISTINCT r.event_id) AS eventos_atendidos
FROM dbt_prd.dim__eventsResponders r
JOIN dbt_prd.fct__events e ON e.event_id = r.event_id AND e.event_type = r.event_type
LEFT JOIN dbt_prd.dim__teams t ON t.team_id::text = r.responder_uid AND r.responder_type = 'teams'
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  AND r.deleted_at IS NULL
  {resp_filter}
GROUP BY r.responder_type, r.responder_uid, t.team_name
ORDER BY eventos_atendidos DESC;
```
