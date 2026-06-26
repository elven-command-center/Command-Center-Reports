# Brand assets

Canonical assets shared by all decks rendered with this skill.

## `elven-logo.png`

Logo Elven Works (versão usada no PDF `kontik-zupper-incident-24h.pdf`). Aparece no canto superior direito de todo slide via classe `.logo`.

- Fonte: extraído de `kontik-zupper-incident-2026-05-08/assets/elven-logo.png`.
- Tamanho recomendado em CSS: `width: 104px`.
- Quando exportar versão maior/menor: refaça do brand kit oficial.

> **Roadmap v0.2+**: substituir por SVG self-contained pra ficar crisp em zoom de PDF.

## `sample-chart-errors.svg` / `sample-chart-throughput.svg`

Gráficos de exemplo (inline SVG, ~2KB) usados pelos layouts `chart-and-cards`, `chart-full` e nos fixtures de teste. Em deck real, substitua por chart export real (PNG ou SVG) do Grafana / dashboard.
