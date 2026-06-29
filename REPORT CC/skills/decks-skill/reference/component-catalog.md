# Component catalog

Todos os componentes do tema `elven-deck.css`. São combináveis livremente dentro de `.content`. Para combinações testadas, ver `slide-recipes.md`.

> Regra: não invente classe nova. Falta algo? Abra issue.

---

## Moldura (obrigatória em todo slide)

### `.slide` + variante

```html
<section class="slide">          <!-- light, padrão -->
<section class="slide dark">     <!-- fundo escuro -->
<section class="slide cover">    <!-- gradiente, só slide 01 -->
<section class="slide split-dark"><!-- metade dark / metade light -->
```

Canvas fixo 1280×720. Numeração de página automática (canto inferior direito).

### `.logo`

```html
<img class="logo" src="assets/elven-logo.png" alt="Elven" />
<img class="logo on-dark" src="assets/elven-logo.png" alt="Elven" />
```

Canto superior direito. Em `slide dark`/`cover` o tema já branqueia o logo automaticamente; `on-dark` é declaração explícita (recomendada) e escape hatch manual. `on-light` força colorido.

### `.content`

A moldura editorial. `position: absolute; inset: 52px 72px 54px 72px`. **Tudo do slide mora aqui**, exceto `.logo`, `.metric-rail` e `.source`.

### `.source`

```html
<div class="source">Fonte: query, datasource, metodologia.</div>
```

Rodapé esquerdo, texto pequeno. Para citar origem dos dados.

---

## Tipografia

| Classe / tag | Uso |
|---|---|
| `.kicker` | etiqueta small caps no topo do `.content` (obrigatória). Traço esquerdo automático. |
| `h1` | headline da capa (68px) |
| `h2` | headline dos demais slides (42px) |
| `h3` | título de card (20px) |
| `.sub` | subtítulo da capa (22px, claro) |
| `.light-sub` | subtítulo em slide light (18px, cinza) |
| `.mono` | trecho inline em fonte monoespaçada - variáveis, nomes técnicos |

---

## Capa

### `.metric-rail` › `.metric`

```html
<div class="metric-rail">
  <div class="metric">
    <div class="value">13:47</div>
    <div class="label">descrição curta do número-âncora</div>
  </div>
  <!-- 4 metrics -->
</div>
```

Régua de 4 números-âncora no rodapé da capa. Fica FORA do `.content` (irmão dele).

---

## Grids de composição

| Classe | Colunas |
|---|---|
| `.two-col` | 1fr 1fr |
| `.three-col` | 3 × 1fr |
| `.score-grid` | 1.2fr 0.8fr (gráfico + lateral) |

Todos com `margin-top` e `gap` embutidos.

---

## Cards

### `.panel`

```html
<div class="panel">
  <h3>Título do card</h3>
  <p>Texto. Aceita também &lt;ul&gt;&lt;li&gt;.</p>
</div>
```

Card branco genérico. `.panel.dark-panel` = variante de fundo escuro (para usar em slide light). Card branco mantém texto escuro mesmo em `slide dark` - automático.

### `.evidence-row` › `.evidence`

```html
<div class="evidence-row">
  <div class="evidence hot"><div class="big">dado</div><div class="small">contexto</div></div>
  <div class="evidence warn">…</div>
  <div class="evidence">…</div>
</div>
```

Cards com tarja superior grossa. `.hot` (vermelho), `.warn` (âmbar), padrão (teal). `.big` = número grande, `.small` = legenda.

### `.chart-card` › `.chart` + `.note`

```html
<div class="chart-card">
  <div class="chart-title"><strong>Título</strong><span>séries</span></div>
  <div class="chart" id="grafico-x"></div>
  <div class="note">O que observar no gráfico.</div>
</div>
```

`.chart-card.compact` = altura menor. O `.chart` é preenchido pelo motor de gráficos (ver `elven-deck-charts.js`).

---

## Callout

```html
<div class="callout"><strong>Rótulo:</strong> destaque escuro.</div>
<div class="callout light"><strong>Leitura final:</strong> destaque claro.</div>
```

Barra lateral teal. `<strong>` é o rótulo tipado (`Leitura final:`, `Interpretação:`, `Ação recomendada:`). `.light` = card branco (mais comum em slide light).

---

## Timeline

```html
<div class="timeline">
  <div class="tl-item hot">
    <div class="tl-time">10h</div>
    <div class="tl-title">Título do marco</div>
    <div class="tl-copy">O que aconteceu.</div>
  </div>
  <!-- até 6 itens -->
</div>
```

Régua horizontal. Marcador: padrão (teal), `.hot` (vermelho), `.warn` (âmbar).

---

## Matrix (tabela)

```html
<div class="matrix">
  <div class="matrix-row matrix-head"><div>Col A</div><div>Col B</div>…</div>
  <div class="matrix-row">
    <div>célula</div>
    <div class="risk high">texto de risco</div>
  </div>
</div>
```

Tabela de dados / plano de ação. `.matrix-head` = cabeçalho. `.risk` colore: `.high` (vermelho), `.med` (âmbar escuro), `.low` (teal).

---

## Code

```html
<div class="code">funcao(args)
  passo 1
  retorno: x</div>
```

Bloco de código, fundo escuro, fonte monoespaçada. Preserva quebras de linha.

---

## Diagram

```html
<div class="diagram">
  <div class="node"><h3>Nó A</h3><p>Descrição.</p></div>
  <div class="arrow">+</div>
  <div class="node"><h3>Nó B</h3><p>Descrição.</p></div>
  <div class="arrow">&rarr;</div>
  <div class="node"><h3>Nó C</h3><p>Descrição.</p></div>
</div>
```

5 colunas: nó / seta / nó / seta / nó. `.arrow` aceita `+`, `&rarr;`, etc.

---

## Decision

```html
<div class="decision">
  <div class="yes"><h3>O que sim</h3><p class="light-sub">…</p></div>
  <div class="no"><h3>O que não</h3><p class="light-sub">…</p></div>
</div>
```

Par de cards comparativos. `.yes` tarja teal, `.no` tarja vermelha. Cards brancos com texto escuro (automático em qualquer variante de slide).

---

## Takeaways

```html
<div class="takeaways">
  <div class="takeaway">Ponto de fechamento.</div>
  <!-- 4-6 itens, grade 2 colunas -->
</div>
```

Lista de fechamento. Marcador quadrado teal (lima em slide dark).

---

## Tags

```html
<div class="tag-row">
  <span class="tag">Etiqueta</span>
</div>
```

Etiquetas categóricas. **Substituem emoji** - nunca use emoji no corpo do deck (lint L10).

---

## Texto em cards brancos sobre slide dark

`.panel`, `.evidence`, `.node`, `.decision .yes/.no` são sempre brancos e **forçam texto escuro** mesmo dentro de `slide dark`. Você não precisa (e não deve) sobrescrever a cor - senão o título some. Se precisa de um card escuro num slide light, use `.panel.dark-panel`.
