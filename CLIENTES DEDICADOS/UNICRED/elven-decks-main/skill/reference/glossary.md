# Glossário — decks-skill

Termos usados pelo skill, na voz da casa.

---

**Agenda** — Plano de tempo do dia/sessão. Em workshop, vive em `agenda/day-X.md`.

**Brand tokens** — Variáveis CSS imutáveis (`--teal`, `--paper`, etc) que definem a identidade Elven. Ver `brand-tokens.md`.

**Callout** — Bloco de destaque com barra lateral teal e rótulo tipado em `<strong>` ("Leitura final:", "Interpretação:"). Componente `.callout` / `.callout.light`.

**Card** — Container de informação. No tema: `.panel` (genérico), `.evidence` (com tarja), `.node` (diagrama), `.chart-card` (gráfico).

**Charts (motor de gráficos)** — `elven-deck-charts.js`. Expõe `ElvenDeck.lineChart` e `ElvenDeck.barChart` — gráficos SVG data-driven.

**Client-report-deck** — Tipo canônico. Deck consumido em PDF pelo cliente, sem presenter.

**Code** — Bloco de código, fundo escuro, fonte monoespaçada. Componente `.code`.

**Compose-model** — O modelo do skill: não há layout fixo por slide; cada slide é uma variante + `.content` + composição de componentes.

**Contact-sheet** — Grid 4-col com todos os slides em miniatura. Gerado por `decks-skill preview`. Para QA visual rápido.

**Content** — A moldura editorial do slide (`.content`). Todo conteúdo mora dentro dela. Obrigatória (lint L7).

**Cover** — Primeiro slide. Sempre `class="slide cover"` (gradiente). Lint L6.

**CSS counter** — Mecanismo que numera slides automaticamente (`01, 02, …`).

**Day script (teleprompter)** — Script contínuo do dia, em `materials/speaker-notes/day-X-script.md`.

**Deck** — Apresentação de slides. Em arquivo: `<main class="deck">` com vários `<section class="slide">`.

**Decision** — Par de cards comparativos (`.decision` › `.yes` / `.no`).

**Diagram** — Diagrama de fluxo: nós + setas (`.diagram` › `.node` / `.arrow`).

**Evidence** — Card de evidência com tarja superior colorida (`.evidence`, variantes `.hot`/`.warn`).

**Fala pronta** — Seção da speaker note com o texto real a ser dito em voz alta.

**Fixture** — Arquivo HTML de teste (`tests/fixtures/`): `pass-*.html` (deve passar) e `fail-*.html` (deve falhar uma regra).

**Frame** — O canvas do slide. Sempre 1280×720 px (16:9).

**Hands-on** — Bloco prático do workshop com execução pelos alunos.

**Headline** — Tese principal do slide. `h1` na capa (68px), `h2` nos demais (42px), peso 900.

**Kicker** — Etiqueta small caps no topo do `.content`, traço esquerdo automático. Obrigatória (lint L8). Componente `.kicker`.

**Lab** — Roteiro hands-on do workshop, em `labs/day-X/lab.md`.

**Lint binário** — Verificação 10/10 de regras estruturais sobre o HTML do deck. `decks-skill lint`.

**Logo** — Logo Elven no canto superior direito. Componente `.logo`. Branco automático em slide dark/cover. Obrigatório (lint L9).

**Matrix** — Tabela de dados / plano de ação (`.matrix` › `.matrix-row`, `.risk`).

**Metric-rail** — Régua de 4 números-âncora no rodapé da capa (`.metric-rail` › `.metric`).

**MTTD / MTTR** — Mean time to detect / to recover. Métricas comuns em incident reports.

**Numeração** — Page number no canto inferior direito, format `01, 02, …`.

**Objetivo do slide** — Seção da speaker note declarando o que o slide instala na plateia.

**Panel** — Card branco genérico (título + texto). Componente `.panel`.

**Paper** — Cor de fundo do slide light (`#f4f7f8`). Token `--paper`.

**Persona** — Audiência alvo (cliente-stakeholder, turma-mentoria, instrutor-elven, etc).

**Preview** — Conjunto de PNGs por slide gerado por `decks-skill preview` (1.5×). Inclui `contact-sheet.png`.

**Read-only inspection** — Inspeção de código sem editar. Padrão em PS report.

**Receita (slide recipe)** — Combinação testada de componentes para um tipo de slide. Ver `slide-recipes.md`.

**Render** — Conversão HTML → PDF via Puppeteer. `decks-skill render`.

**Scaffold** — Pasta inicial criada por `decks-skill new`, com placeholders.

**Slide** — Unidade do deck. `<section class="slide">`, variantes `dark`/`cover`/`split-dark`. Sempre 1280×720.

**Source** — Linha de fonte/metodologia no rodapé esquerdo do slide. Componente `.source`.

**Source-notes.md** — Anotações de origem dos dados em client-report-deck. Garante rastreabilidade.

**Speaker note** — Markdown com 4 seções (Objetivo / Fala pronta / Interação / Versão curta) acompanhando um slide em workshop.

**Sub / light-sub** — Subtítulo do slide. `.sub` (capa, 22px claro), `.light-sub` (slide light, 18px cinza).

**Tag** — Etiqueta categórica pill (`.tag`). Substitui emoji — emoji é banido (lint L10).

**Takeaway** — Item de fechamento (`.takeaways` › `.takeaway`).

**Teal** — Cor accent primária (`#00bfa5`). Token `--teal`.

**Template** — Pasta inicial em `skill/templates/<tipo>/` que `decks-skill new` copia.

**Theme** — `themes/elven-deck.css`. Define tokens, frame e componentes.

**Timeline** — Linha do tempo com até 6 marcos (`.timeline` › `.tl-item`).

**Token** — Variável CSS canônica em `:root`. Mudar quebra o brand.

**Variante de slide** — `slide` (light), `slide dark`, `slide cover`, `slide split-dark`.

**Versão curta** — Seção da speaker note com 1 frase resumindo o slide.

**Visual QA** — Inspeção do contact-sheet pra problemas que o lint não pega.

**Workshop-mentorship-deck** — Tipo canônico. Pacote multi-dia com agenda + slides + labs + speaker notes + script.
