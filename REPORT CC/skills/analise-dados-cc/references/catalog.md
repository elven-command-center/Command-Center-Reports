# Catálogo de Métricas — Command Center

Este arquivo define quais métricas entram no relatório padrão e quais são opcionais.
**Você pode editar este arquivo** para ajustar o que compõe o relatório padrão ou adicionar/remover opções.

---

## Métricas do Relatório Padrão

Estas métricas são sempre incluídas quando o usuário escolhe a opção `0. Seguir padrão`.

| # | Métrica | Descrição | Slide |
|---|---------|-----------|-------|
| P1 | Volume total de alertas | Total de eventos no período | Capa + Resumo |
| P2 | MTTR médio | Tempo médio de resolução (HH:MM:SS) | Capa + Resumo |
| P3 | MTTA médio | Tempo médio de reconhecimento (HH:MM:SS) | Capa + Status |
| P4 | Taxa de resolução | % de eventos resolvidos sobre total | Capa + Resumo |
| P5 | Status dos eventos | Matrix ACK × Resolução (4 quadrantes) | Slide Status |
| P6 | Distribuição por severidade | Sev-1 vs Not Classified + TTR >30min | Slide Severidade |
| P7 | Top 5 alertas por volume | Títulos com mais disparos no período | Slide Volume |
| P8 | Top 5 alertas recorrentes | Títulos que aparecem em mais dias distintos | Slide Recorrência |
| P9 | Top 5 TTR prolongado | Alertas com maior tempo de resolução (>30min) | Slide TTR |
| P10 | Distribuição por tags | Categorização dos eventos por tag | Slide Tags |
| P11 | Alertas críticos em aberto | Top 5 por TTR acumulado ainda não resolvidos | Slide Alertas |
| P12 | Conclusão e próximos passos | Análise interpretativa + recomendações | Slide Conclusão |

---

## Opções Adicionais do Catálogo

O usuário pode adicionar qualquer combinação destas opções ao relatório padrão.

| # | Métrica | Descrição |
|---|---------|-----------|
| 1 | SLA | Compliance com SLA, violações e plano contratado |
| 2 | IA | Eventos tratados pela IA (`ai_touched = true`) e status de execução (`ai_execution_status`) |
| 3 | Runbook | Cobertura de runbooks por evento (`has_runbook`) |
| 4 | Recorrência detalhada | Lista completa de títulos recorrentes com dias, total, severidade e TTR médio |
| 5 | Lista detalhada de eventos | Tabela completa do período para rastreabilidade |
| 6 | Cota contratada | Uso mensal de eventos vs cota do plano (alerta se >100%) |
| 7 | Tendência de volume | Série histórica de 30 dias com volume diário |
| 8 | Distribuição por horário | Business Hour / Off Hour / Sleep Hour (`event_time_cluster_tzbr`) |
| 9 | Canais de notificação | WhatsApp, on_call, Slack, Teams (`channels` em dim__eventsCommandCenter) |
| 10 | Times respondedores | Equipes que atuaram no período (`dim__eventsResponders`) |

---

## Como apresentar o catálogo ao usuário

Sempre liste assim, numerado, sem bullet points:

```
0. Seguir padrão
1. SLA — compliance, violações e plano contratado
2. IA — eventos tratados pela IA e status de execução
3. Runbook — cobertura de runbooks por evento
4. Recorrência detalhada — lista completa com dias, total, severidade e TTR médio
5. Lista detalhada de eventos — tabela completa do turno para rastreabilidade
6. Cota contratada — uso mensal vs cota (alerta se >100%)
7. Tendência de volume — histórico 30 dias com série diária
8. Distribuição por horário — Business Hour / Off Hour / Sleep Hour
9. Canais de notificação — WhatsApp, on_call, Slack, Teams…
10. Times respondedores — equipes que atuaram no período
```
