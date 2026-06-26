# Fonte — NOC BLIP 23–24/06/2026

Gerado **direto do Data Warehouse via ODBC** (DSN `PostgreSQL35W`, schema `dbt_prd`), sem `.docx`.
Filtro: `org_uid = '2bfb84fe-d4ab-4e08-ad6f-602bd019f9e1'` e `event_happened_tzbr::date BETWEEN '2026-06-23' AND '2026-06-24'`.
Join `fct__events` ↔ `dim__eventsMetrics`/`dim__eventsTags` por `event_id + event_type`.

## Valores extraídos

| Métrica | Valor |
|---|---|
| Total de eventos | 2.780 |
| MTTR médio (ttr resolvidos) | 3.308 s → 00:55:08 |
| Resolvidos | 2.712 → 98% (97,6%) |

**Status (matriz ACK × resolução)**
- ACK + Resolvido: 1.544 (55,5%)
- Resolvido sem ACK: 1.168 (42,0%)
- ACK sem Resolução: 64 (2,3%)
- Sem ACK e Sem Resolução: 4 (0,1%)

**Severidade**: sev-1-critical 595 (21%) · not-classified 2.185 (79%) · TTR>30min 654 (24%)

**Top 5 volume**: Pods restart LGTM 136 · Low cmd rate Husky 125 · Pods restart Golden 122 · Memory Beagle 102 · CPU Take 101

**Recorrência (histórico completo, dias distintos / total disparos)**:
Memory Golden 291/25.410 · Pods restart Take 291/10.964 · Msgs/s bancopan 289/434 · CPU Take 288/9.650 · MsgHub DataIO Replica 287/287

**TTR>30min por título**: Memory Beagle 48 · CPU Take 36 · Pods Golden 32 · Builder Beagle 30 · CPU Beagle 30
Maior TTR: Memory Usage Limits by Pod - Take = 121.440 s → 33:44:00. Cluster dominante: Beagle.

**Tags (grafana_folder, eventos distintos)**: SRE 1.170 (42%) · Kubernetes 878 (32%) · Iris Server 320 (12%) · Iris Application 175 (6%) · Infrastructure 65 (2%). Infra (k8s/infra/cluster) = 970. Categorias distintas = 14.

**Alertas em aberto (não resolvidos, tempo acumulado now() - event_happened)**:
1. Memory Usage Limits by Pod - Maltes — 57:58:10 — Maltes
2. Erros app msging-application-media - Take — 56:00:50 — Take
3. Ingress 4.*/5.* (NGINX) - Take — 55:54:50 — Take
4. DatasourceNoData — 55:04:30 — Grafana
5. Memory Usage Limits by Pod - Golden — 55:03:10 — Golden

> Extração com `_extract_range.py` (na raiz do projeto durante a geração; removido após).
