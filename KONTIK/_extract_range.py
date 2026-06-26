# -*- coding: utf-8 -*-
import pyodbc, json

ORG = 'e6c88769-8a85-42be-8709-fc67660d3f5a'
D1, D2 = '2026-06-24', '2026-06-25'

cn = pyodbc.connect("DSN=PostgreSQL35W")
cur = cn.cursor()

JM = "m.event_id = e.event_id AND m.event_type = e.event_type"
JT = "t.event_id = e.event_id AND t.event_type = e.event_type"
# Filtro de responsavel: somente eventos com "Time NOC - Elven" entre os responders
RJ = ("JOIN dbt_prd.dsh__events_noc_investigation r "
      "ON r.event_id = e.event_id AND r.event_type = e.event_type "
      "AND 'Time NOC - Elven' = ANY(r.responder_names)")

def q(sql, args=()):
    cur.execute(sql, args)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]

out = {}

# base CTE filter reused: events of org in period
PERIOD = "e.org_uid = ? AND e.event_happened_tzbr::date BETWEEN ? AND ?"
A = (ORG, D1, D2)

# --- Totais / capa ---
out['total'] = q(f"""
  SELECT count(*) AS total
  FROM dbt_prd.fct__events e
  {RJ}
  WHERE {PERIOD}
""", A)[0]['total']

# MTTR medio (segundos) sobre resolvidos com ttr nao nulo
out['mttr_sec'] = q(f"""
  SELECT avg(m.ttr) AS mttr
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsMetrics" m ON {JM}
  {RJ}
  WHERE {PERIOD} AND m.ttr IS NOT NULL
""", A)[0]['mttr']

# Taxa de resolucao
out['resolvidos'] = q(f"""
  SELECT count(*) AS c
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsMetrics" m ON {JM}
  {RJ}
  WHERE {PERIOD} AND m.is_resolved = true
""", A)[0]['c']

# --- Slide 3: matriz ACK x Resolucao ---
out['matrix'] = q(f"""
  SELECT
    coalesce(m.is_ack,false) AS is_ack,
    coalesce(m.is_resolved,false) AS is_resolved,
    count(*) AS c
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsMetrics" m ON {JM}
  {RJ}
  WHERE {PERIOD}
  GROUP BY 1,2
""", A)

# --- Slide 4: severidade ---
out['severidade'] = q(f"""
  SELECT coalesce(nullif(trim(e.severity),''),'not-classified') AS sev, count(*) AS c
  FROM dbt_prd.fct__events e
  {RJ}
  WHERE {PERIOD}
  GROUP BY 1 ORDER BY c DESC
""", A)

# TTR > 30 min
out['ttr30'] = q(f"""
  SELECT count(*) AS c
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsMetrics" m ON {JM}
  {RJ}
  WHERE {PERIOD} AND m.ttr > 1800
""", A)[0]['c']

# --- Slide 5: top 5 volume por titulo ---
out['top_volume'] = q(f"""
  SELECT e.title, count(*) AS c
  FROM dbt_prd.fct__events e
  {RJ}
  WHERE {PERIOD}
  GROUP BY e.title ORDER BY c DESC LIMIT 5
""", A)

# --- Slide 6: recorrencia (historico completo do org, mesmo responsavel) ---
out['recorrencia'] = q(f"""
  SELECT e.title,
         count(DISTINCT e.event_happened_tzbr::date) AS dias,
         count(*) AS total
  FROM dbt_prd.fct__events e
  {RJ}
  WHERE e.org_uid = ?
  GROUP BY e.title
  HAVING count(DISTINCT e.event_happened_tzbr::date) > 1
  ORDER BY dias DESC, total DESC LIMIT 5
""", (ORG,))

# --- Slide 7: top 5 titulos por TTR>30min (qtd de eventos) + maior TTR ---
out['ttr_titulos'] = q(f"""
  SELECT e.title, count(*) AS c
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsMetrics" m ON {JM}
  {RJ}
  WHERE {PERIOD} AND m.ttr > 1800
  GROUP BY e.title ORDER BY c DESC LIMIT 5
""", A)

out['ttr_max'] = q(f"""
  SELECT e.title, m.ttr
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsMetrics" m ON {JM}
  {RJ}
  WHERE {PERIOD} AND m.ttr IS NOT NULL
  ORDER BY m.ttr DESC LIMIT 1
""", A)

# --- Slide 8: tags grafana_folder ---
out['tags'] = q(f"""
  SELECT split_part(t.tag, ':', 2) AS folder, count(DISTINCT e.event_id) AS c
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsTags" t ON {JT}
  {RJ}
  WHERE {PERIOD} AND t.tag LIKE 'grafana_folder:%'
  GROUP BY 1 ORDER BY c DESC LIMIT 5
""", A)

out['tags_distintas'] = q(f"""
  SELECT count(DISTINCT split_part(t.tag, ':', 2)) AS c
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsTags" t ON {JT}
  {RJ}
  WHERE {PERIOD} AND t.tag LIKE 'grafana_folder:%'
""", A)[0]['c']

# infra: kubernetes/redis/pods/node
out['tags_infra'] = q(f"""
  SELECT count(DISTINCT e.event_id) AS c
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsTags" t ON {JT}
  {RJ}
  WHERE {PERIOD} AND t.tag LIKE 'grafana_folder:%'
    AND lower(t.tag) ~ 'kubernetes|redis|pod|node|infra|cluster'
""", A)[0]['c']

# --- Slide 9: alertas criticos em aberto (nao resolvidos), tempo acumulado ---
out['abertos'] = q(f"""
  SELECT e.title,
         coalesce(nullif(trim(e.severity),''),'not-classified') AS sev,
         extract(epoch FROM (now() - e.event_happened_at)) AS idade_sec
  FROM dbt_prd.fct__events e
  JOIN dbt_prd."dim__eventsMetrics" m ON {JM}
  {RJ}
  WHERE {PERIOD} AND coalesce(m.is_resolved,false) = false
  ORDER BY e.event_happened_at ASC LIMIT 5
""", A)

print(json.dumps(out, default=str, ensure_ascii=False, indent=1))
cn.close()
