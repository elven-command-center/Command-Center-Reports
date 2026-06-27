# Queries SQL — Command Center Analytics

Todas as queries usam `database=data_warehouse`, `schema=dbt_prd`.
Substitua os placeholders antes de executar:
- `{org_uid}` → uid do cliente (de orgs.json)
- `{date_start}` → data início no formato `YYYY-MM-DD`
- `{date_end}` → data fim no formato `YYYY-MM-DD` (inclusive)

---

## P1 — Volume total de alertas

```sql
SELECT COUNT(*) AS total_eventos
FROM dbt_prd.fct__events
WHERE org_uid = '{org_uid}'
  AND event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND deleted_at IS NULL;
```

---

## P2 — MTTR médio

```sql
SELECT
  AVG(m.ttr) AS mttr_segundos,
  TO_CHAR((AVG(m.ttr) || ' seconds')::interval, 'HH24:MI:SS') AS mttr_formatado
FROM dbt_prd.dim__eventsMetrics m
JOIN dbt_prd.fct__events e ON e.event_id = m.event_id AND e.event_type = m.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND m.is_resolved = true
  AND e.deleted_at IS NULL;
```

---

## P3 — MTTA médio

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
  AND e.deleted_at IS NULL;
```

---

## P4 — Taxa de resolução

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
  AND e.deleted_at IS NULL;
```

---

## P5 — Status dos eventos (matrix ACK × Resolução)

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
  AND e.deleted_at IS NULL;
```

---

## P6 — Distribuição por severidade + TTR prolongado

```sql
-- Severidade
SELECT
  COUNT(*) FILTER (WHERE e.severity = 'sev1') AS sev1_qtd,
  COUNT(*) FILTER (WHERE e.severity != 'sev1' OR e.severity IS NULL) AS not_class_qtd,
  COUNT(*) AS total
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL;

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
  AND e.deleted_at IS NULL;
```

---

## P7 — Top 5 alertas por volume

```sql
SELECT
  e.title,
  COUNT(*) AS qtd
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
GROUP BY e.title
ORDER BY qtd DESC
LIMIT 5;
```

---

## P8 — Top 5 alertas recorrentes (dias distintos)

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
GROUP BY e.title, e.severity
HAVING COUNT(DISTINCT e.event_happened_tzbr::date) > 1
ORDER BY dias_distintos DESC, total_disparos DESC
LIMIT 5;
```

---

## P9 — Top 5 TTR prolongado (>30min)

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
GROUP BY e.title
ORDER BY qtd_ttr_longo DESC
LIMIT 5;
```

---

## P10 — Distribuição por tags

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
GROUP BY t.tag
ORDER BY qtd DESC
LIMIT 10;
```

---

## P11 — Alertas críticos em aberto

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
ORDER BY m.ttr DESC NULLS LAST
LIMIT 5;
```

---

## C1 — SLA (catálogo adicional)

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
GROUP BY cc.sla_duration, cc.plan_name;
```

---

## C5 — Lista detalhada de eventos (catálogo adicional)

```sql
SELECT
  e.title,
  e.severity,
  e.event_happened_tzbr::date AS data,
  TO_CHAR((m.ttr || ' seconds')::interval, 'HH24:MI:SS') AS ttr,
  m.is_ack,
  m.is_resolved
FROM dbt_prd."fct__events" e
LEFT JOIN dbt_prd."dim__eventsMetrics" m ON m.event_id = e.event_id AND m.event_type = e.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
ORDER BY e.event_happened_tzbr DESC
LIMIT 30;
```

---

## C2 — IA (catálogo adicional)

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
GROUP BY e.ai_execution_status;
```

---

## C3 — Runbook (catálogo adicional)

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
GROUP BY cc.runbook_type;
```

---

## C7 — Tendência de volume 30 dias (catálogo adicional)

```sql
SELECT
  e.event_happened_tzbr::date AS dia,
  COUNT(*) AS qtd
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date >= ('{date_end}'::date - INTERVAL '30 days')
  AND e.event_happened_tzbr::date <= '{date_end}'
  AND e.deleted_at IS NULL
GROUP BY dia
ORDER BY dia;
```

---

## C8 — Distribuição por horário (catálogo adicional)

```sql
SELECT
  e.event_time_cluster_tzbr AS cluster_horario,
  COUNT(*) AS qtd,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 1) AS pct
FROM dbt_prd.fct__events e
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
GROUP BY e.event_time_cluster_tzbr
ORDER BY qtd DESC;
```

---

## C9 — Canais de notificação (catálogo adicional)

```sql
SELECT
  UNNEST(cc.channels) AS canal,
  COUNT(*) AS qtd
FROM dbt_prd.dim__eventsCommandCenter cc
JOIN dbt_prd.fct__events e ON e.event_id = cc.event_id AND e.event_type = cc.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
GROUP BY canal
ORDER BY qtd DESC;
```

---

## C10 — Times respondedores (catálogo adicional)

```sql
SELECT
  r.responder_type,
  r.responder_uid,
  COUNT(DISTINCT r.event_id) AS eventos_atendidos
FROM dbt_prd.dim__eventsResponders r
JOIN dbt_prd.fct__events e ON e.event_id = r.event_id AND e.event_type = r.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
  AND r.deleted_at IS NULL
GROUP BY r.responder_type, r.responder_uid
ORDER BY eventos_atendidos DESC;
```
