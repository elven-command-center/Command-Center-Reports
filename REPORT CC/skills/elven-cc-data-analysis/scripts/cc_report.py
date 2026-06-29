# -*- coding: utf-8 -*-
"""
Roda todas as queries do relatorio Command Center de uma vez, com saida COMPACTA
(economiza tokens vs reescrever script + JSON indentado a cada relatorio).

Uso:
  python cc_report.py --org <org_uid> --start YYYY-MM-DD --end YYYY-MM-DD [--catalog 5,7] [--all-teams]

Padrao (sempre roda): P1..P11.
Catalogo extra via --catalog (numeros do catalog.md): 1=SLA 2=IA 3=Runbook 5=Lista 7=Tendencia 8=Horario 9=Canais 10=Times.
Filtro padrao Responder = "Time NOC - Elven" embutido; use --all-teams para remover.
"""
import argparse, pyodbc

ap = argparse.ArgumentParser()
ap.add_argument("--org", required=True)
ap.add_argument("--start", required=True)
ap.add_argument("--end", required=True)
ap.add_argument("--catalog", default="")
ap.add_argument("--all-teams", action="store_true")
a = ap.parse_args()

ORG, D0, D1 = a.org, a.start, a.end
EXTRAS = {x.strip() for x in a.catalog.split(",") if x.strip()}

RESP = "" if a.all_teams else """
  AND EXISTS (SELECT 1 FROM dbt_prd."dim__eventsResponders" r
    JOIN dbt_prd."dim__teams" t ON t.team_id::text = r.responder_uid
    WHERE r.event_id = e.event_id AND r.event_type = e.event_type
      AND r.deleted_at IS NULL AND r.responder_type = 'teams'
      AND TRIM(t.team_name) = 'Time NOC - Elven' AND t.org_uid = '%s')""" % ORG

conn = pyodbc.connect('DSN=PostgreSQL35W;Database=data_warehouse', timeout=60)
cur = conn.cursor()

def run(sql):
    sql = sql.replace('{org}', ORG).replace('{d0}', D0).replace('{d1}', D1).replace('{resp}', RESP)
    cur.execute(sql)
    cols = [c[0] for c in cur.description]
    return cols, cur.fetchall()

def one(label, sql):
    """Imprime uma linha por resultado: label | col=val col=val ..."""
    cols, rows = run(sql)
    if not rows:
        print(f"{label}: (vazio)")
        return
    for r in rows:
        vals = " ".join(f"{c}={'' if v is None else v}" for c, v in zip(cols, r))
        print(f"{label}: {vals}")

def table(label, sql):
    """Imprime lista compacta: label seguido de linhas pipe-delimitadas."""
    cols, rows = run(sql)
    print(f"{label}: ({len(rows)} linhas) " + " | ".join(cols))
    for r in rows:
        print("  " + " | ".join('' if v is None else str(v) for v in r))

W = "e.org_uid='{org}' AND e.event_happened_tzbr::date BETWEEN '{d0}' AND '{d1}' AND e.deleted_at IS NULL {resp}"
M = "dbt_prd.\"dim__eventsMetrics\" m JOIN dbt_prd.fct__events e ON e.event_id=m.event_id AND e.event_type=m.event_type"

one("P1_total", f"SELECT COUNT(*) total FROM dbt_prd.fct__events e WHERE {W}")
one("P2_mttr", f"SELECT TO_CHAR((AVG(m.ttr)||' seconds')::interval,'HH24:MI:SS') mttr, AVG(m.ttr)::int seg FROM {M} WHERE {W} AND m.is_resolved=true")
one("P3_mtta", f"SELECT TO_CHAR((AVG(m.tta)||' seconds')::interval,'HH24:MI:SS') mtta, COUNT(*) FILTER (WHERE m.is_ack) com_ack FROM {M} WHERE {W} AND m.is_ack=true")
one("P4_taxa", f"SELECT COUNT(*) total, COUNT(*) FILTER (WHERE m.is_resolved) resolvidos, ROUND(COUNT(*) FILTER (WHERE m.is_resolved)::numeric/NULLIF(COUNT(*),0)*100,1) taxa FROM {M} WHERE {W}")
one("P5_status", f"SELECT COUNT(*) FILTER (WHERE m.is_ack AND m.is_resolved) ack_res, COUNT(*) FILTER (WHERE NOT m.is_ack AND m.is_resolved) res_sem_ack, COUNT(*) FILTER (WHERE m.is_ack AND NOT m.is_resolved) ack_sem_res, COUNT(*) FILTER (WHERE NOT m.is_ack AND NOT m.is_resolved) nada, COUNT(*) total FROM {M} WHERE {W}")
one("P6_sev", f"SELECT COUNT(*) FILTER (WHERE e.severity='sev-1-critical') sev1, COUNT(*) FILTER (WHERE e.severity='sev-2-high') sev2, COUNT(*) FILTER (WHERE e.severity NOT IN ('sev-1-critical','sev-2-high') OR e.severity IS NULL) outros, COUNT(*) total FROM dbt_prd.fct__events e WHERE {W}")
one("P6_ttr30", f"SELECT COUNT(*) qtd, TO_CHAR((MAX(m.ttr)||' seconds')::interval,'HH24:MI:SS') ttr_max FROM {M} WHERE {W} AND m.ttr>1800 AND m.is_resolved=true")
table("P7_volume", f"SELECT e.title, COUNT(*) qtd FROM dbt_prd.fct__events e WHERE {W} GROUP BY e.title ORDER BY qtd DESC LIMIT 5")
table("P8_recorrencia", f"SELECT e.title, COUNT(DISTINCT e.event_happened_tzbr::date) dias, COUNT(*) total, e.severity, TO_CHAR((AVG(m.ttr)||' seconds')::interval,'HH24:MI:SS') ttr_medio FROM dbt_prd.fct__events e LEFT JOIN dbt_prd.\"dim__eventsMetrics\" m ON m.event_id=e.event_id AND m.event_type=e.event_type WHERE {W} GROUP BY e.title, e.severity HAVING COUNT(DISTINCT e.event_happened_tzbr::date)>1 ORDER BY dias DESC, total DESC LIMIT 5")
table("P9_ttr_longo", f"SELECT e.title, COUNT(*) qtd, TO_CHAR((MAX(m.ttr)||' seconds')::interval,'HH24:MI:SS') ttr_max FROM {M} WHERE {W} AND m.ttr>1800 AND m.is_resolved=true GROUP BY e.title ORDER BY qtd DESC LIMIT 5")
table("P10_tags", f"SELECT t.tag, COUNT(*) qtd, ROUND(COUNT(*)::numeric/SUM(COUNT(*)) OVER ()*100,1) pct FROM dbt_prd.\"dim__eventsTags\" t JOIN dbt_prd.fct__events e ON e.event_id=t.event_id AND e.event_type=t.event_type WHERE {W} AND t.deleted_at IS NULL GROUP BY t.tag ORDER BY qtd DESC LIMIT 10")
table("P11_aberto", f"SELECT e.title, e.severity, TO_CHAR((m.ttr||' seconds')::interval,'HH24:MI:SS') ttr_acum, e.cause FROM {M} WHERE {W} AND m.is_resolved=false ORDER BY m.ttr DESC NULLS LAST LIMIT 5")

if "1" in EXTRAS:
    table("C1_sla", f"SELECT cc.sla_duration, cc.plan_name, COUNT(*) total_ack, COUNT(*) FILTER (WHERE m.tta<=cc.sla_duration) dentro, COUNT(*) FILTER (WHERE m.tta>cc.sla_duration) fora, ROUND(COUNT(*) FILTER (WHERE m.tta<=cc.sla_duration)::numeric/NULLIF(COUNT(*),0)*100,1) compliance FROM dbt_prd.\"dim__eventsMetrics\" m JOIN dbt_prd.fct__events e ON e.event_id=m.event_id AND e.event_type=m.event_type JOIN dbt_prd.\"dim__commandCenterClients\" cc ON cc.org_uid=e.org_uid WHERE {W} AND m.is_ack=true AND cc.deleted_at IS NULL GROUP BY cc.sla_duration, cc.plan_name")
if "2" in EXTRAS:
    table("C2_ia", f"SELECT e.ai_execution_status, COUNT(*) qtd, COUNT(*) FILTER (WHERE e.ai_touched) ia FROM dbt_prd.fct__events e WHERE {W} GROUP BY e.ai_execution_status ORDER BY qtd DESC")
if "3" in EXTRAS:
    table("C3_runbook", f"SELECT cc.runbook_type, COUNT(*) qtd, COUNT(*) FILTER (WHERE cc.has_runbook) com_rb FROM dbt_prd.\"dim__eventsCommandCenter\" cc JOIN dbt_prd.fct__events e ON e.event_id=cc.event_id AND e.event_type=cc.event_type WHERE {W} GROUP BY cc.runbook_type ORDER BY qtd DESC")
if "5" in EXTRAS:
    table("C5_lista", f"SELECT TO_CHAR(e.event_happened_tzbr::date,'DD/MM/YYYY') data, e.title, COUNT(*) qtd, TO_CHAR((AVG(m.tta)||' seconds')::interval,'HH24:MI:SS') tta, TO_CHAR((AVG(m.ttr)||' seconds')::interval,'HH24:MI:SS') ttr FROM dbt_prd.fct__events e LEFT JOIN dbt_prd.\"dim__eventsMetrics\" m ON m.event_id=e.event_id AND m.event_type=e.event_type WHERE {W} GROUP BY e.event_happened_tzbr::date, e.title ORDER BY e.event_happened_tzbr::date DESC, qtd DESC LIMIT 18")
if "7" in EXTRAS:
    table("C7_tendencia", f"SELECT e.event_happened_tzbr::date dia, COUNT(*) qtd FROM dbt_prd.fct__events e WHERE e.org_uid='{org}' AND e.event_happened_tzbr::date>=('{d1}'::date-INTERVAL '30 days') AND e.event_happened_tzbr::date<='{d1}' AND e.deleted_at IS NULL {resp} GROUP BY dia ORDER BY dia".replace('{org}',ORG).replace('{d1}',D1).replace('{resp}',RESP))
if "8" in EXTRAS:
    table("C8_horario", f"SELECT e.event_time_cluster_tzbr cluster, COUNT(*) qtd, ROUND(COUNT(*)::numeric/SUM(COUNT(*)) OVER ()*100,1) pct FROM dbt_prd.fct__events e WHERE {W} GROUP BY e.event_time_cluster_tzbr ORDER BY qtd DESC")
if "9" in EXTRAS:
    table("C9_canais", f"SELECT UNNEST(cc.channels) canal, COUNT(*) qtd FROM dbt_prd.\"dim__eventsCommandCenter\" cc JOIN dbt_prd.fct__events e ON e.event_id=cc.event_id AND e.event_type=cc.event_type WHERE {W} GROUP BY canal ORDER BY qtd DESC")
if "10" in EXTRAS:
    table("C10_times", f"SELECT COALESCE(t.team_name, r.responder_uid) time, COUNT(DISTINCT r.event_id) eventos FROM dbt_prd.\"dim__eventsResponders\" r JOIN dbt_prd.fct__events e ON e.event_id=r.event_id AND e.event_type=r.event_type LEFT JOIN dbt_prd.\"dim__teams\" t ON t.team_id::text=r.responder_uid AND r.responder_type='teams' WHERE {W} AND r.deleted_at IS NULL GROUP BY COALESCE(t.team_name, r.responder_uid) ORDER BY eventos DESC")

conn.close()
