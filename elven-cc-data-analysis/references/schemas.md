# Schema - dbt_prd (data_warehouse)

Conexão: `DSN=PostgreSQL35W`, `Database=data_warehouse`

## Tabelas principais

### fct__events - Eventos (tabela central)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| event_id | bigint | ID único do evento |
| event_type | text | Tipo do evento |
| org_uid | varchar | UID da organização (chave de filtro por cliente) |
| title | text | Título/nome do alerta |
| cause | text | Causa / serviço / cluster |
| status | varchar | Status atual |
| severity | varchar | Severidade (`sev1`, etc.) |
| event_happened_tzbr | timestamp | Data/hora do evento (timezone BR, sem fuso) |
| event_happened_at | timestamptz | Data/hora do evento (UTC) |
| event_time_cluster_tzbr | text | Cluster horário: `Business Hour`, `Off Hour`, `Sleep Hour` |
| ai_touched | boolean | Foi processado pela IA? |
| ai_execution_status | varchar | Status de execução da IA |
| human_touched | boolean | Teve interação humana? |
| deleted_at | timestamptz | Null = ativo; não-null = deletado |

### dim__eventsMetrics - Métricas calculadas por evento
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| event_id | bigint | FK para fct__events |
| event_type | text | FK para fct__events |
| org_uid | text | UID da organização |
| is_ack | boolean | Foi reconhecido? |
| date_ack | timestamptz | Quando foi reconhecido |
| is_resolved | boolean | Foi resolvido? |
| date_resolved | timestamptz | Quando foi resolvido |
| tta | bigint | Time to Acknowledge (segundos) |
| ttr | bigint | Time to Resolve (segundos) |
| ttd | bigint | Time to Detect (segundos) |
| response_effort | bigint | Esforço de resposta |

### fct__eventsHistory - Histórico de ações por evento
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| event_id | bigint | FK para fct__events |
| event_type | text | Tipo do evento |
| org_uid | varchar | UID da organização |
| action | varchar | Ação realizada (`acknowledged`, `resolved`, etc.) |
| user_id | bigint | Usuário que executou a ação |
| event_happened_tzbr | timestamp | Data/hora (BR) |
| status | varchar | Status após a ação |

### dim__eventsCommandCenter - Metadados do Command Center
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| event_id | bigint | FK para fct__events |
| has_runbook | boolean | Possui runbook associado? |
| has_sre_elven_on_call | boolean | SRE Elven on-call ativado? |
| is_closed | boolean | Evento fechado no CC? |
| channels | ARRAY | Canais de notificação usados |
| runbook_type | text | Tipo de runbook |
| closed_tzbr | timestamp | Data/hora de fechamento (BR) |

### dim__eventsTags - Tags dos eventos
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| event_id | bigint | FK para fct__events |
| event_type | text | Tipo do evento |
| tag | text | Tag/categoria do evento |

### dim__eventsResponders - Respondedores
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| event_id | bigint | FK para fct__events |
| responder_type | varchar | Tipo: team, user, etc. |
| responder_uid | varchar | UID do respondedor |

### dim__commandCenterClients - Configuração do plano por cliente
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| cc_client_id | bigint | ID interno |
| org_uid | varchar | UID da organização (chave de filtro) |
| plan_name | varchar | Plano contratado (ex: `mtta15`) |
| contracted_quota | int | Cota de eventos contratada (0 = ilimitado) |
| sla_duration | int | SLA em segundos (ex: 900 = 15 min) |
| support_hours | varchar | Horário de suporte (ex: `24x7`) |
| sre_elven | boolean | SRE Elven ativo? |

### dim__orgs - Organizações
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| org_uid | varchar | UID único (chave principal de filtro) |
| org_id | bigint | ID numérico |
| org_name | text | Nome da organização |
| plan_name | varchar | Plano contratado |
| is_active | boolean | Organização ativa? |

### dsh__events_noc_investigation - View denormalizada (1 linha = 1 evento, sem JOIN)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| event_id, event_type | bigint, text | Chave do evento |
| org_uid | varchar | UID da organização |
| title, severity | text, varchar | Título e severidade |
| tta, ttr | bigint | Em segundos, já calculados |
| is_ack, is_resolved | boolean | Status já calculado |
| responder_names | ARRAY(text) | Nomes dos times/respondedores do evento, ex: `{NOC,"Time NOC - Elven"}` - filtrar com `'Time NOC - Elven' = ANY(responder_names)`, sem precisar de JOIN em `dim__eventsResponders`/`dim__teams` |
| tags | ARRAY(text) | Mesmos valores de `dim__eventsTags.tag` - filtrar com `'tag' = ANY(tags)` ou overlap `tags && ARRAY['tag1','tag2']` |
| is_deleted | text (`'0'`/`'1'`) | **Não é `deleted_at`.** Esta view NÃO exclui eventos deletados por padrão - é obrigatório filtrar `AND is_deleted = '0'` manualmente, senão eventos deletados entram na contagem (testado: gerava +1 evento fantasma sev-1-critical num relatório de Unicred) |
| channels, origin_names | ARRAY | Canais de notificação, origens |

Útil para queries ad-hoc que precisam filtrar por responder ou tags sem escrever JOIN - mas sempre incluir `is_deleted = '0'`.

## Join padrão

```sql
FROM dbt_prd.fct__events e
LEFT JOIN dbt_prd.dim__eventsMetrics m
  ON m.event_id = e.event_id AND m.event_type = e.event_type
WHERE e.org_uid = '{org_uid}'
  AND e.event_happened_tzbr::date BETWEEN '{date_start}' AND '{date_end}'
  AND e.deleted_at IS NULL
```
