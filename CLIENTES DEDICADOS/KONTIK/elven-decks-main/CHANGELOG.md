# Changelog

All notable changes to `@elven-observability/decks-skill` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [SemVer](https://semver.org/).

## [Unreleased]

## [0.1.2] — 2026-05-17

Correção de qualidade visual. O tema reconstruído na 0.1.1 saiu apertado e os
gráficos vinham vazios; esta versão alinha o output ao deck de referência real
`kontik-zupper-incident-2026-05-17`.

### Fixed

- `elven-deck.css` reescrito a partir do CSS real do deck kontik 05-17 (fonte da
  verdade): cards com moldura e respiro corretos, `.content` com inset fixo,
  `h1`/`h2` na escala certa, `.chart-card`/`.panel`/`.evidence`/`.timeline`/
  `.matrix`/`.diagram` com proporções do deck aprovado. Acabou o visual apertado.
- `elven-deck-charts.js` ganhou `groupedBars` (barras agrupadas hoje-vs-ontem) e
  marcador vertical no `lineChart` — antes os slides de gráfico ficavam fracos
  ou vazios.
- Logo em fundo escuro: além da classe `.logo.on-dark`, o tema agora aplica
  `filter: brightness(0) invert(1)` automaticamente em `.slide.cover`/`.slide.dark`.
  O autor não precisa mais lembrar — a variante do slide resolve.
- Lint L6 reconhece o token `cover` em qualquer posição da lista de classes
  (ex: `class="slide layout-cover cover"`), exigindo o token isolado.

### Added

- Componente `.code-block` para hands-on de workshop (bloco mono com borda teal,
  comentários e marcações `OK`).

## [0.1.1] — 2026-05-15

Primeiro release público. A versão `0.1.0` foi queimada no registro npm (publicada e despublicada — o npm reserva números de versão permanentemente), então o primeiro release instalável é o `0.1.1`.

### Sistema visual — modelo de composição kontik

O tema reproduz verbatim o sistema visual do deck aprovado `kontik-zupper-incident-24h`. **Não há "layout fixo por slide"**: cada slide é uma variante (`light` / `dark` / `cover` / `split-dark`) com uma moldura `.content`, dentro da qual se compõem componentes do tema.

### Added

- Dois templates canônicos: `client-report-deck` (slides PDF entregues ao cliente, sem presenter) e `workshop-mentorship-deck` (mentoria multi-dia com speaker notes + labs + agenda).
- `themes/elven-deck.css` — sistema visual locked: paleta (teal `#00bfa5`, paper `#f4f7f8`, ink `#0f1923`, …), Inter + IBM Plex Mono via system fallback, frame 1280×720, numeração CSS counter `decimal-leading-zero`.
- Componentes: `.kicker`, `.sub`/`.light-sub`/`.mono`, `.metric-rail`, `.two-col`/`.three-col`/`.score-grid`, `.panel`, `.chart-card`/`.chart`/`.note`, `.timeline`/`.tl-item`, `.callout`, `.evidence`/`.evidence-row`, `.matrix`, `.code`, `.diagram`/`.node`/`.arrow`, `.decision`, `.takeaways`, `.tag`.
- `themes/elven-deck-charts.js` — motor de gráficos SVG data-driven (`ElvenDeck.lineChart` / `barChart`).
- Lint binário 10 regras (`decks-skill lint`): L1 DOCTYPE+lang pt-BR, L2 `<title>`, L3 tema, L4 `.slide`, L5 canvas 1280×720, L6 slide 01 = `cover`, L7 `.content` em todo slide, L8 `.kicker` em todo slide, L9 `.logo` em todo slide, L10 sem emoji.
- Render PDF (`decks-skill render`): Puppeteer, 1280×720, 1 página/slide, print backgrounds.
- Preview PNG + contact-sheet (`decks-skill preview`): 1.5× (1920×1080).
- Scaffold (`decks-skill new client-report|workshop <slug>`).
- Install parity com `@elven-observability/docs-skill`.
- 8 docs de referência: `brand-tokens`, `slide-recipes`, `component-catalog`, `editorial-voice`, `artifact-contract`, `quality-gate`, `speaker-notes-spec`, `glossary`.
- 3 checklists: `pre-deliver`, `visual-qa`, `persona-coverage`.
- 8 fixtures de lint (2 pass + 6 fail) + test runners.

### Fixed

- Logo branco automático em `slide cover`/`slide dark` via `filter: brightness(0) invert(1)` — o wordmark verde-escuro sumia no fundo escuro.
- Cards brancos (`.panel`, `.evidence`, `.node`, `.decision`) mantêm texto escuro mesmo em `slide dark` — antes o `h3` herdava branco e o título sumia (branco-no-branco).

### Not in scope (deferred to v0.2+)

- Talk/keynote single-session template (sem fixture real).
- Internal company decks (all-hands, sprint demo).
- Multi-theme (paleta cliente substituindo Elven).
- Self-hosted fonts (Inter + IBM Plex Mono via @font-face).
- Markdown narrativo → HTML deck (conversão automática).
- pt → en translation.
- Animação/transição em slides (deck é print/PDF).
