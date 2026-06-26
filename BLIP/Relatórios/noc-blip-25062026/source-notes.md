# Source notes — NOC Blip 25/06/2026

**Fonte:** Data Warehouse PostgreSQL 17 via **ODBC** (DSN `PostgreSQL35W`, db `data_warehouse`, user `noc_user`), extração direta com `pyodbc`.

- **Org Blip:** `org_uid = 2bfb84fe-d4ab-4e08-ad6f-602bd019f9e1` (org_id 3078)
- **Período:** `event_happened_tzbr::date = '2026-06-25'`
- **Tabelas:** `dbt_prd.fct__events`, `dbt_prd."dim__eventsMetrics"`, `dbt_prd."dim__eventsTags"`
- Colunas reais: `ttr`, `is_resolved`, `is_ack`, `event_time_cluster_tzbr`, `tag`

## Capa / métricas globais
- Total de eventos: **1.568**
- MTTR médio (resolvidos): 2091 s = **00:34:51**
- Taxa de resolução: 1.519 / 1.568 = **97%**
- Eventos em aberto: **49** (5 sev-1-critical)

## Status (matriz ACK × Resolução) — total 1.568 ✓
| Status | Qtd | % |
|---|---|---|
| ACK + Resolvido | 844 | 53,8% |
| Resolvido sem ACK | 675 | 43,1% |
| ACK sem Resolução | 41 | 2,6% |
| Sem ACK e Sem Resolução | 8 | 0,5% |

## Severidade
- sev-1-critical: **321** (20%) ; not-classified: **1.247** (80%)
- TTR > 30 min (>1800s): **415** (26,5%)
- TTR máximo: 67.012 s = **18:36:52** → "Lag acima do limite - lognotificationconsumer – Caramelo" (Business Hour)

## Top 5 volume (dia 25)
1. Pods restart - Take — 106
2. Memory Usage Limits by Pod - Beagle — 90
3. [Lime Gateway][Commands rate]Low commands rate - Husky — 63
4. Pods restart - Golden — 60
5. [CRITICAL] Operation Execution Times - Avg Command above 1 sec — 57

## Recorrência (histórico completo — dias distintos / total disparos)
1. Memory Usage Limits by Pod - Golden — 292 dias — 25.449
2. Pods restart - Take — 291 dias — 10.975
3. [Feriado] Mensagens por segundo enviadas pelo bot bancopanatendrouterprd — 290 dias — 436
4. CPU Usage Limits by pod - Take — 288 dias — 9.700
5. MessagingHub DataIO - Replica — 288 dias — 288

## TTR prolongado (top 5 títulos com eventos TTR>30min, dia 25)
1. Pods restart - Take — 106
2. Memory Usage Limits by Pod - Beagle — 32
3. Memory Usage Limits by Pod - Dobermann — 24
4. Memory Usage Limits by Pod - Husky — 21
5. [Lime Gateway][Commands rate]Low commands rate - Husky — 17
Cluster principal: Business Hour.

## Tags / contexto (grafana_folder, distinct event_id, dia 25)
1. SRE — 632 — 40,3%
2. Kubernetes — 509 — 32,5%
3. Iris Server — 226 — 14,4%
4. DBRE MongoDB — 56 — 3,6%
5. Iris Application — 52 — 3,3%
Categorias distintas (grafana_folder): 13. Infra (Kubernetes) = 509.

## Alertas em aberto ao final do turno (eventos do dia 25, TTR calculado até 23:59:59)
1. Memory Usage Limits by Pod - Golden — not-classified — 23:47:59 — Sleep Hour
2. [Lime Gateway][Commands rate]Low commands rate - Husky — not-classified — 18:10:19 — Sleep Hour
3. Detecção de Baixo Volume - Husky — sev-1-critical — 17:53:49 — Sleep Hour
4. Blip-server - Command pipeline rate - Husky — not-classified — 17:48:29 — Sleep Hour
5. Memory Usage Limits by Pod - Dobermann — not-classified — 17:47:59 — Sleep Hour
Total abertos (dia 25): 49. sev-1-critical abertos: 5.
