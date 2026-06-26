# Source notes — NOC Blip 23/06/2026

**Fonte:** Data Warehouse PostgreSQL via **ODBC** (DSN `PostgreSQL35W`, db `data_warehouse`, user `noc_user`), extração direta com `pyodbc` — sem `.docx`.
Org Blip `org_uid = 2bfb84fe-d4ab-4e08-ad6f-602bd019f9e1` (org_id 3078). Período: `event_happened_tzbr::date = '2026-06-23'`.
Tabelas: `dbt_prd.fct__events`, `dbt_prd."dim__eventsMetrics"`, `dbt_prd."dim__eventsTags"`.

## Capa / métricas globais
- Total de eventos: **1.358**
- MTTR médio (resolvidos): 4014,83 s = **01:06:55**
- Taxa de resolução: 1.336 / 1.358 = **98%**
- Eventos em aberto: **22** (0 sev-1)

## Status (matriz ACK × Resolução) — total 1.358 ✓
| Status | Qtd | % |
|---|---|---|
| ACK + Resolvido | 785 | 57,8% |
| Resolvido sem ACK | 551 | 40,6% |
| ACK sem Resolução | 19 | 1,4% |
| Sem ACK e Sem Resolução | 3 | 0,2% |

## Severidade
- sev-1-critical: **283** (21%) ; not-classified: **1.075** (79%)
- TTR > 30 min (>1800s): **344** (25%)
- TTR máximo: 121.440 s = **33:44:00** → "Memory Usage Limits by Pod - Take" (Off Hour)

## Top 5 volume (dia 23)
1. Pods restart - Golden — 75
2. [Lime Gateway] Low commands rate - Husky — 64
3. Memory Usage Limits by Pod - Beagle — 56
4. CPU Usage Limits by pod - Beagle — 53
5. Pods restart - LGTM — 42
(Soma top 5 = 290.)

## Recorrência (histórico completo — dias distintos / total disparos)
1. Memory Usage Limits by Pod - Golden — 291 dias — 25.410
2. Pods restart - Golden — 210 dias — 15.200
3. Memory Usage Limits by Pod - Labrador — 260 dias — 11.981
4. Node CPU Usage - LGTM — 220 dias — 11.784
5. Pods restart - LGTM — 252 dias — 11.439
(Soma top 5 ≈ 76 mil disparos. Janela de dados: 2025-08-26 → 2026-06-25.)

## TTR prolongado (top 5 títulos com eventos TTR>30min, dia 23)
1. DatasourceNoData — 23
2. Memory Usage Limits by Pod - Beagle — 22
3. CPU Usage Limits by pod - Beagle — 20
4. Pods restart - Golden — 20
5. Pods restart - Tools — 17
Distribuição por cluster: Business Hour 191, Sleep Hour 105, Off Hour 48. Cluster principal: **Business Hour**.

## Tags / contexto (grafana_folder, distinct event_id, dia 23)
1. SRE — 561 — 41%
2. Kubernetes — 436 — 32%
3. Iris Server — 154 — 11%
4. Iris Application — 96 — 7%
5. Infrastructure — 36 — 3%
Categorias distintas (grafana_folder): 13. Infra (Kubernetes) = 436.

## Alertas críticos em aberto (não resolvidos; tempo acumulado = now − happened, dedup por título)
1. Memory Usage Limits by Pod - Maltes — not-classified — 57:43:46 — Sleep Hour
2. Erros para a aplicação - msging-application-media - Take — not-classified — 55:46:26 — Sleep Hour
3. Ingress - Status 4.* & 5.* (NGINX) - Take — not-classified — 55:40:26 — Sleep Hour
4. DatasourceNoData — not-classified — 54:50:06 — Sleep Hour
5. Memory Usage Limits by Pod - Golden — not-classified — 54:48:46 — Sleep Hour
Total abertos: 22. **sev-1 abertos: 0** (nenhum crítico pendente).
