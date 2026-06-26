---
name: elven-decks-skill
description: |
  Padroniza criação, revisão e renderização (PDF + preview PNG) de apresentações
  16:9 da Elven Works. Cobre 2 tipos canônicos: client-report-deck (kontik-style,
  cliente lê PDF sem presenter) e workshop-mentorship-deck (mentoria multi-dia
  com speaker notes + labs + agenda). Sistema visual locked extraído do deck
  aprovado kontik: variante de slide + .content + composição livre de
  componentes, paleta e fontes do brand Elven, lint binário 10/10, motor de
  gráficos SVG, e render Puppeteer. Use SEMPRE que o usuário pedir "criar deck",
  "fazer apresentação cliente", "workshop multi-dia", "report visual incidente",
  ou quando for redigir/revisar HTML de slide Elven. NÃO use para docs flowing
  (use @elven-observability/docs-skill), talk/keynote curto single-session,
  internal demo, ou brand não-Elven.
---

# Elven Decks Skill

Skill que produz decks Elven Works no padrão da casa — identidade visual idêntica ao deck aprovado `kontik-zupper-incident-24h` — sem improvisar em cor, fonte ou estrutura.

**Modelo:** não existe "layout fixo por slide". Cada slide é uma **variante** (`light` / `dark` / `cover` / `split-dark`) com uma **moldura** (`.content`) dentro da qual você **compõe** componentes do tema. As "receitas" em `reference/slide-recipes.md` mostram combinações testadas.

---

## Antes de começar — checagem rápida

Pare e responda:

1. **Tipo do deck ∈ {`client-report-deck`, `workshop-mentorship-deck`}?** Se for talk/keynote curto, internal demo (all-hands, sprint), ou outro tipo, **PARE — out of scope**. Resposta ao usuário: "Esse tipo ainda não tem template canônico. Abra issue em https://github.com/elven-observability/elven-decks; por enquanto escreva sem skill, ou use `@elven-observability/docs-skill` se o material couber em texto corrido."
2. **É pt-BR?** Se en-US/es-LA, **PARE** — v0.1 é pt-BR-only.
3. **Brand é Elven Works?** Se o cliente exige brand próprio (logo, paleta), **PARE** e escale — v0.1 tem só o tema Elven; multi-tema é roadmap.

Se passou nas 3 verificações, siga abaixo.

---

## Workflow (11 passos)

### Passo 1 — Identificar o tipo

Pergunta única: **"Quem vai consumir o deck?"**

- **a)** Cliente lendo PDF assincronamente, sem presenter → **`client-report-deck`**
  - Exemplo canônico: `kontik-zupper-incident-24h`
- **b)** Turma em sala + instrutor ao vivo, multi-dia, com labs hands-on → **`workshop-mentorship-deck`**
  - Exemplo canônico: "Observability: From Zero to Hero" (3 dias)
- **c)** Nenhum dos dois → **PARE**. Não improvise tipo.

### Passo 2 — Scaffold

```bash
decks-skill new client-report kontik-incidente-2026-05-08
# ou
decks-skill new workshop curso-observabilidade-2026
```

Cria a pasta com `deck.html` + `elven-deck.css` + `elven-deck-charts.js` + placeholders em pt-BR. O `deck.html` já passa no lint 10/10 — edite a partir dele.

### Passo 3 — Cabeçalho do HTML

- `<html lang="pt-BR">` (lint L1 exige)
- `<title>` descritivo — `Cliente | Tipo | Período` (client-report) ou `Curso — Dia X` (workshop)
- `<link rel="stylesheet" href="elven-deck.css">`
- `<script src="elven-deck-charts.js">` antes do `</body>` se houver gráficos

Para workshop, preencha também `README.md`, `agenda/day-X.md`, e cada `materials/speaker-notes/day-X/NN-*.md`.

### Passo 4 — Estrutura de todo slide

Todo slide segue a MESMA moldura (o lint checa). Sem exceção:

```html
<section class="slide">          <!-- variante: "slide" | "slide dark" | "slide cover" | "slide split-dark" -->
  <img class="logo" src="assets/elven-logo.png" alt="Elven" />   <!-- on-dark em slide dark/cover -->
  <div class="content">          <!-- a moldura editorial — tudo mora aqui -->
    <div class="kicker">Categoria do slide</div>
    <h2>Headline que diz a tese do slide.</h2>
    <!-- composição livre de componentes aqui -->
  </div>
  <div class="source">Fonte / query / metodologia.</div>
</section>
```

Regras invioláveis:

- **Slide 01 é sempre `class="slide cover"`** (lint L6).
- **Todo slide tem `.logo`, `.content` e `.kicker`** (lint L7, L8, L9).
- Logo: `class="logo on-dark"` em slide `dark`/`cover` (o tema também branqueia automático, mas declare por clareza).
- `h1` só na capa; `h2` nos demais.

### Passo 5 — Compor o slide com componentes do tema

Dentro do `.content`, componha livremente. Catálogo completo com markup em **`reference/slide-recipes.md`** e **`reference/component-catalog.md`**. Resumo:

| Componente | Para que serve |
|---|---|
| `.metric-rail` › `.metric` (`.value`+`.label`) | régua de 4 números-âncora — só na capa |
| `.two-col` / `.three-col` / `.score-grid` | grids de composição |
| `.panel` | card branco genérico (título + texto/lista) |
| `.chart-card` › `.chart` + `.note` | card de gráfico (ver Passo 6) |
| `.timeline` › `.tl-item` (`.hot`/`.warn`) | linha do tempo, até 6 marcos |
| `.callout` / `.callout.light` | destaque tipado (`<strong>` colorido) |
| `.evidence-row` › `.evidence` (`.hot`/`.warn`) | cards de evidência com tarja superior |
| `.matrix` › `.matrix-row` (`.matrix-head`, `.risk`) | tabela de dados / plano de ação |
| `.code` | bloco de código mono fundo escuro |
| `.diagram` › `.node` + `.arrow` | diagrama de fluxo/arquitetura |
| `.decision` › `.yes` / `.no` | par de cards comparativos |
| `.takeaways` › `.takeaway` | fechamento — lista de pontos |
| `.tag-row` › `.tag` | etiquetas (substitui emoji) |

**Não invente classe nova.** Se falta um componente, abra issue. Toda combinação de slide vem das receitas — não improvise CSS.

### Passo 6 — Gráficos (quando houver dados)

Gráficos são SVG data-driven via `elven-deck-charts.js`:

```html
<div class="chart" id="meu-grafico"></div>
...
<script src="elven-deck-charts.js"></script>
<script>
  function renderCharts() {
    ElvenDeck.lineChart(document.getElementById("meu-grafico"), [
      { name: "RPS", data: [/* … */], color: ElvenDeck.colors.teal },
      { name: "P95", data: [/* … */], color: ElvenDeck.colors.red }
    ], { labels: ["20h","21h", /* … */], xticks: [0,6,12,18,24], max: 10 });
  }
  window.addEventListener("load", renderCharts);
  window.addEventListener("resize", renderCharts);
</script>
```

`ElvenDeck.lineChart` e `ElvenDeck.barChart`. Sempre defina `renderCharts()` com esse nome — o renderizador de PDF a chama explicitamente.

### Passo 7 — Conteúdo: regras de escrita

- **Kicker**: small caps, curto (2-3 palavras). Traço esquerdo automático.
- **Headline** (`h1`/`h2`): Inter 900, declarativa — diz a TESE, não o tópico.
- **Código / variáveis / nomes técnicos**: sempre em `<span class="mono">` ou `.code`.
- **Callout**: `<strong>` tipado — `Leitura final:`, `Interpretação:`, `Ação recomendada:`.
- **Sem emojis** (lint L10). Use `.tag` para etiquetas, `.hot`/`.warn` para semântica.
- **Cards brancos** (`.panel`, `.evidence`, `.node`, `.decision`) mantêm texto escuro mesmo em slide `dark` — é automático.

### Passo 8 — (Workshop only) Speaker notes + Labs

Cada slide vira `materials/speaker-notes/day-X/NN-slug.md` com **4 seções na ordem exata**: `## Objetivo do slide`, `## Fala pronta`, `## Interação opcional`, `## Versão curta`. Mais um `day-X-script.md` teleprompter. Spec: `reference/speaker-notes-spec.md`.

Cada dia: `labs/day-X/lab.md` com `## O que se prova`, `## Pré-requisitos`, `## Execução`, `## Sucesso`, `## Falhas esperadas`, `## Debrief`.

### Passo 9 — Lint binário (gate 10/10)

```bash
decks-skill lint deck.html
```

Esperado: `exit 0` com `10/10`. As 10 regras:

| # | Regra |
|---|---|
| L1 | `<!DOCTYPE html>` + `<html lang="pt-BR">` |
| L2 | `<title>` presente e não-vazio |
| L3 | Tema importado (`elven-deck.css` ou tokens `--teal:#00bfa5` inline) |
| L4 | Pelo menos um `.slide` |
| L5 | Canvas 1280×720 declarado |
| L6 | Primeiro slide é `class="slide cover"` |
| L7 | Todo slide tem `.content` |
| L8 | Todo slide tem `.kicker` |
| L9 | Todo slide tem `.logo` |
| L10 | Sem emoji em texto visível |

Resolva TODOS antes de prosseguir.

### Passo 10 — Preview visual + Render PDF

```bash
decks-skill preview deck.html    # gera preview/slide-NN.png + contact-sheet.png
decks-skill render  deck.html --out deck.pdf
```

**Abra o `contact-sheet.png`** e bata `checklists/visual-qa.md`: overflow, contraste, alinhamento, card branco com título sumido, headline longa demais, slide vazio embaixo. Resolva antes do PDF final.

### Passo 11 — Pre-deliver

Bata `checklists/pre-deliver.md`: conteúdo conferido contra `source-notes.md`, cliente/data na capa, speaker notes prontas (workshop), PDF abre limpo em viewer externo. Só entregue com 100%.

---

## Triggers explícitos

### Use ESTE skill quando o usuário diz

- "criar deck pra cliente sobre \<X\>"
- "fazer apresentação de incidente \<Y\>"
- "preparar mentoria/workshop multi-dia sobre \<Z\>"
- "atualizar slides do workshop"
- "gerar PDF deck do report \<W\>"
- "lintar / preview / contact-sheet do deck"

### NÃO use ESTE skill quando

- O material é **doc flowing** (texto corrido, guia técnico) → use **`@elven-observability/docs-skill`**.
- É **talk/keynote single-session curto** sem labs → out of scope, abrir issue.
- É **internal demo casual** → out of scope.
- Brand é **não-Elven** → escale.
- Material é **en-US/es-LA** → pt-BR only.
- Quer **animação/transição** → decks são print/PDF, estáticos.

Se ambíguo, **pergunte ao usuário em vez de improvisar**.

---

## Personas alvo

| Persona | Quem é |
|---|---|
| `cliente-stakeholder` | C-level ou líder de área lendo PDF report |
| `cliente-eng` | Engenheiro do cliente lendo análise técnica |
| `cliente-sre` | SRE do cliente em incident response |
| `turma-mentoria` | Engenheiros em treinamento multi-dia |
| `instrutor-elven` | Engenheiro Elven entregando a mentoria |
| `agente-ia` | Sentinel, Claude Code, ou outro AI redigindo/revisando deck |

Matriz template × audience: `checklists/persona-coverage.md`.

---

## Recursos do skill

- **Templates**: `templates/{client-report-deck,workshop-mentorship-deck}/`
- **Receitas de slide** (combinações testadas): `reference/slide-recipes.md`
- **Catálogo de componentes**: `reference/component-catalog.md`
- **Tema CSS**: `themes/elven-deck.css`
- **Motor de gráficos**: `themes/elven-deck-charts.js`
- **Brand tokens (locked)**: `reference/brand-tokens.md`
- **Voz editorial**: `reference/editorial-voice.md`
- **Spec de speaker notes**: `reference/speaker-notes-spec.md`
- **Quality gates**: `reference/quality-gate.md`
- **Artifact contract**: `reference/artifact-contract.md`
- **Glossário**: `reference/glossary.md`
- **Checklists**: `checklists/pre-deliver.md`, `visual-qa.md`, `persona-coverage.md`
- **Scripts**: `scripts/lint.sh`, `render-deck.js`, `preview-deck.js`

---

## O que esse skill DELIBERADAMENTE não faz

- **Não inventa componente fora do catálogo.** Falta algo? Abra issue.
- **Não migra decks legados automaticamente.** Migração visual é PR humano.
- **Não traduz pt→en.** v0.1 é pt-BR-only.
- **Não converte markdown narrativo → HTML deck.** Editar HTML é o fluxo; `slides/day-X.md` é só planning.
- **Não anima.** Slides são print/PDF, estáticos.
- **Não suporta brand não-Elven.** Multi-tema é roadmap.
- **Não lintha prosa.** Lint é estrutural (10/10). Review de texto é humano.
- **Não substitui review humano.** Lint + checklist + visual QA são guard-rails; o review final é seu.
