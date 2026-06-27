---
name: feedback-fluxo-relatorio
description: Sequência obrigatória de perguntas ao executar relatório NOC — data, cliente, catálogo de informações
metadata:
  type: feedback
---

Ao receber qualquer gatilho de relatório ("execute o relatório", "relatório", "relatório do dia X"), fazer as perguntas **em sequência, uma por vez**:

**1. Qual a data?**

**2. Qual o cliente?**
Listar todos os clientes do `orgs.json` numerados, sem bullet points, com o número na frente do nome:
1. Onfly
2. Elven observability
3. Dotz
4. Cogtive
5. Conta Azul
6. Elven Works
7. Grupo Irrah
8. 1sTi
9. JCA
10. MultiClubes
11. Radar E-commerce
12. Sleep up
13. TotalPass
14. Trillia
15. Vórtx
16. Solucx

**3. Catálogo de informações — adicionar ao relatório?**
Listar sempre as opções numeradas (sem bullet points):
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
10. Times respondedores — equipes que atuaram no turno

**Why:** Projeto multi-cliente com blocos opcionais via catálogo DW. Iniciar sem data/cliente gera dados errados.

**How to apply:** Sempre nessa ordem, antes de qualquer consulta ODBC ou criação de pasta. Clientes e org_uids em `CLIENTES/orgs.json`. Ver `memory/reference-odbc-datawarehouse.md` para detalhes do DW.
