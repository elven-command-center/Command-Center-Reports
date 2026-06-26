# Source notes — NOC Blip 24/06/2026

**Fonte (regeneração):** Data Warehouse PostgreSQL 17 via **ODBC** (DSN `PostgreSQL35W`, db `data_warehouse`, user `noc_user`), extração direta com `pyodbc`.
Validação cruzada: números batem com a versão anterior gerada via Power BI (`dsh__events_noc_investigation`). ✔

- **Org Blip:** `org_uid = 2bfb84fe-d4ab-4e08-ad6f-602bd019f9e1` (org_id 3078)
- **Período:** `event_happened_tzbr::date = '2026-06-24'`
- **Tabelas:** `dbt_prd.fct__events`, `dbt_prd."dim__eventsMetrics"`, `dbt_prd."dim__eventsTags"`
- Nomes camelCase exigem aspas duplas no Postgres (ex.: `"dim__eventsMetrics"`).

## Capa / métricas globais
- Total de eventos: **1.422**
- MTTR médio (resolvidos): 2623,76 s = **00:43:44**
- Taxa de resolução: 1.376 / 1.422 = **97%**
- Eventos em aberto: **46** (3 sev-1)

## Status (matriz ACK × Resolução) — total 1.422 ✓
| Status | Qtd | % |
|---|---|---|
| ACK + Resolvido | 759 | 53,4% |
| Resolvido sem ACK | 617 | 43,4% |
| ACK sem Resolução | 45 | 3,2% |
| Sem ACK e Sem Resolução | 1 | 0,1% |

## Severidade
- sev-1-critical: **312** (22%) ; not-classified: **1.110** (78%)
- TTR > 30 min (>1800s): **310** (21,8%)
- TTR máximo: 70.140 s = **19:29:00** → "Memory Limits by Pod - Take" (Business Hour)

## Top 5 volume (dia 24)
1. Pods restart - LGTM — 94
2. CPU Usage Limits by pod - Take — 62
3. Low commands rate - Husky (Lime Gateway) — 61
4. DatasourceError — 58
5. Pods restart - Golden — 47

## Recorrência (histórico completo — dias distintos / total disparos)
1. Pod com erro de container - Bots — 137 dias — 31.718
2. Memory Limits by Pod - Golden — 291 dias — 25.410
3. Pods restart - Golden — 210 dias — 15.200
4. Memory Limits by Pod - Labrador — 260 dias — 11.981
5. Node CPU Usage - LGTM — 220 dias — 11.783
(Soma top 5 ≈ 96 mil disparos.)

## TTR prolongado (top 5 títulos com eventos TTR>30min, dia 24)
1. Memory Limits by Pod - Beagle — 26
2. CPU Usage Limits by pod - Take — 20
3. Current builder instances by instance - Beagle — 18
4. Memory Limits by Pod - Labrador — 17
5. Memory Limits by Pod - Take — 16
Cluster principal: Business Hour.

## Tags / contexto (grafana_folder, distinct event_id, dia 24)
1. SRE — 609 — 43%
2. Kubernetes — 442 — 31%
3. Iris Server — 166 — 12%
4. Iris Application — 79 — 6%
5. DBRE MongoDB — 29 — 2%
Categorias distintas (grafana_folder): 13. Infra (Kubernetes) = 442.

## Alertas críticos em aberto (não resolvidos; tempo acumulado = now − happened, dedup por título)
1. DatasourceNoData — sev-1-critical — 16:48:49 — Sleep Hour
2. DatasourceError — sev-1-critical — 16:23:19 — Off Hour
3. [CRITICAL] Blip_SQL/Desk - CPU Scale Limit — sev-1-critical — 14:56:29 — Sleep Hour
4. HOST_NOT_ENOUGH_DISK_SPACE — not-classified — 37:01:45 — Sleep Hour
5. Memory Limits by Pod - Labrador — not-classified — 32:31:29 — Sleep Hour
Total abertos: 46 (45 ACK sem resolução + 1 sem ACK). sev-1 abertos: 3.
