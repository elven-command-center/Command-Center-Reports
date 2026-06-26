# Queries cheatsheet — `<Curso>`

Trechos prontos pra colar em Grafana Explore durante a sessão.

## Loki

```logql
# Erros últimos 15 min
{env="prod", service="<service>"} |= "ERROR" | line_format "{{.timestamp}} {{.message}}"
```

```logql
# Trace_id correlation
{env="prod"} |= "<trace_id>"
```

## Prometheus

```promql
# p95 latência
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
```

```promql
# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
  / sum(rate(http_requests_total[5m])) by (service)
```

## Tempo

```
{ service.name="<service>" && status=error }
```
