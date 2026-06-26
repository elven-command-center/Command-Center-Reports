---
name: feedback-fluxo-relatorio
description: Sequência obrigatória de perguntas ao executar relatório NOC — data, cliente, catálogo de informações
metadata:
  type: feedback
---

Ao receber qualquer gatilho de relatório ("execute o relatório", "relatório", "relatório do dia X"), fazer as perguntas **em sequência, uma por vez**:

**1. Qual a data?**

**2. Qual o cliente?**
Listar todos os clientes do `orgs.json`:
- Onfly
- Elven observability
- Dotz
- Cogtive
- Conta Azul
- Elven Works
- Grupo Irrah
- 1sTi
- JCA
- MultiClubes
- Radar E-commerce
- Sleep up
- TotalPass
- Trillia
- Vórtx
- Solucx

**3. Catálogo de informações — adicionar ao relatório?**
Listar sempre as opções:
- Seguir padrão
- SLA — compliance, violações e plano contratado
- IA — eventos tratados pela IA e status de execução
- Runbook — runbook disponível por evento

**Why:** Projeto multi-cliente com blocos opcionais via catálogo DW. Iniciar sem data/cliente gera dados errados.

**How to apply:** Sempre nessa ordem, antes de qualquer consulta ODBC ou criação de pasta. Clientes e org_uids em `CLIENTES/orgs.json`. Ver `memory/reference-odbc-datawarehouse.md` para detalhes do DW.
