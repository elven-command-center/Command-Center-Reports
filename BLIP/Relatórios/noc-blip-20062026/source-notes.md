# Source notes — NOC Blip 20/06/2026

**Fonte:** Data Warehouse PostgreSQL via **ODBC** (DSN `PostgreSQL35W`, db `data_warehouse`, user `noc_user`, schema `dbt_prd`), extração direta com `pyodbc`. Não havia `.docx` para o dia.

- **Org Blip:** `org_uid = 2bfb84fe-d4ab-4e08-ad6f-602bd019f9e1` (org_id 3078)
- **Período:** `event_happened_tzbr::date = '2026-06-20'`
- **Tabelas:** `dbt_prd.fct__events`, `dbt_prd."dim__eventsMetrics"`, `dbt_prd."dim__eventsTags"` (join por `event_id` + `event_type`)
- Nomes camelCase exigem aspas duplas no Postgres. `ttr`/`tta` em segundos.

## Capa / métricas globais
- Total de eventos: **967**
- MTTR médio (resolvidos): 13.147,71 s = **03:39:07** — fortemente puxado pela cauda longa de TTR (um caso de 124h e 314 eventos > 30 min). A mediana é muito menor.
- Taxa de resolução: 959 / 967 = **99%**
- Eventos em aberto: **8** (0 sev-1)

## Status (matriz ACK × Resolução) — total 967 ✓
| Status | Qtd | % |
|---|---|---|
| ACK + Resolvido | 614 | 63,5% |
| Resolvido sem ACK | 345 | 35,7% |
| ACK sem Resolução | 8 | 0,8% |
| Sem ACK e Sem Resolução | 0 | 0,0% |

## Severidade
- sev-1-critical: **229** (24%) ; not-classified: **738** (76%)
- TTR > 30 min (>1800s): **314** (32%)
- TTR máximo: 447.730 s = **124:22:10** → "Node CPU Usage - LGTM" (Sleep Hour)

## Top 5 volume (dia 20)
1. [Lime Gateway][Commands rate] Low commands rate - Husky — 96
2. Pods restart - Tools — 70
3. Pods restart - Golden — 49
4. Commands - Received rate by instance - Dobermann — 48
5. Pods restart - Dalmata — 48

## Recorrência (histórico completo — dias distintos / total disparos)
1. Pod com erro de container - Bots — 137 dias — 31.718
2. Memory Usage Limits by Pod - Golden — 291 dias — 25.436
3. Pods restart - Golden — 210 dias — 15.229
4. Memory Usage Limits by Pod - Labrador — 260 dias — 12.028
5. Node CPU Usage - LGTM — 221 dias — 11.816
(Soma top 5 ≈ 96 mil disparos.)

## TTR prolongado (top 5 títulos com eventos TTR>30min, dia 20)
1. Pods restart - Dalmata — 47
2. Pods restart - Tools — 25
3. Low commands rate - Husky — 24
4. Memory Usage Limits by Pod - Take — 24
5. DatasourceNoData — 22
Cluster principal (mais TTR>30min): Off Hour (182 eventos).

## Tags / contexto (grafana_folder, distinct event_id, dia 20)
1. SRE — 385 — 40%
2. Iris Server — 333 — 34%
3. Kubernetes — 145 — 15%
4. Iris Application — 32 — 3%
5. DBRE - SQL Azure — 25 — 3%
Categorias distintas (grafana_folder): 11. Infra (Kubernetes) = 145.

## Alertas críticos em aberto (não resolvidos; tempo acumulado = now − happened, dedup por título)
1. DatasourceNoData — not-classified — 135:01:22 — Sleep Hour
2. Memory Limits by Pod - Labrador — not-classified — 134:44:32 — Sleep Hour
3. Memory Limits by Pod - Golden — not-classified — 116:49:32 — Off Hour
Total abertos: 8 (todos ACK sem resolução). sev-1 abertos: 0. Apenas 3 títulos distintos → slide com 3 linhas.
