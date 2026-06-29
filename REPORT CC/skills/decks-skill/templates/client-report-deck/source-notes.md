# Source notes - `<slug>`

Use este arquivo para documentar **de onde vieram os dados** que aparecem no deck. Garante rastreabilidade quando o cliente pergunta "como vocês chegaram nesse número?".

---

## Fontes brutas

- **Loki**: `{env="prod", service="<service>"} |= "<filtro>"`
- **Prometheus**: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{…}[5m])) by (le))`
- **Audit logs**: tabela `<tabela>`, query `<sql>`
- **MySQL**: `SELECT … FROM …` (read-only)

## Trechos de código inspecionados (read-only)

- `<arquivo>:<linhas>` - `<descrição>`
- `<classe::método>` - `<descrição>`

## Janela temporal analisada

- **Início**: DD/MM/YYYY HH:MM BRT
- **Fim**: DD/MM/YYYY HH:MM BRT
- **Duração**: X horas

## Links Grafana / dashboards

- Dashboard X: `<url>`
- Panel Y: `<url>`

## Hipóteses descartadas

- **Hipótese A**: descartada porque `<evidência>`.
- **Hipótese B**: descartada porque `<evidência>`.

## Notas internas (não vão no deck)

- `<nota>` - uso pra reviewer entender contexto
