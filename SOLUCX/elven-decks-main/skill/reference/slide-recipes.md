# Slide recipes

Combinações de componentes **testadas** — extraídas do deck aprovado `kontik-zupper-incident-24h`. Não há "layout fixo": cada slide é uma variante (`light`/`dark`/`cover`/`split-dark`) com `.content`, e dentro dela você compõe. Estas receitas são pontos de partida confiáveis.

Toda receita assume a moldura obrigatória (lint L6-L9):

```html
<section class="slide [variante]">
  <img class="logo [on-dark]" src="assets/elven-logo.png" alt="Elven" />
  <div class="content"> … </div>
  <div class="source">Fonte / metodologia.</div>
</section>
```

---

## R1 — Capa (sempre slide 01)

**Quando:** primeiro slide. Variante `cover` (gradiente). `h1` + `.sub` + régua de 4 métricas.

```html
<section class="slide cover">
  <img class="logo on-dark" src="assets/elven-logo.png" alt="Elven" />
  <div class="content">
    <div class="kicker">Cliente / contexto - tipo</div>
    <h1>Headline-tese em uma frase declarativa e forte.</h1>
    <p class="sub">Escopo, fontes e janela temporal.</p>
  </div>
  <div class="metric-rail">
    <div class="metric"><div class="value">00:00</div><div class="label">descrição do número-âncora</div></div>
    <!-- 4 metrics -->
  </div>
  <div class="source">Fonte: Grafana orgId, datasources, cliente, ambiente.</div>
</section>
```

---

## R2 — Resumo executivo

**Quando:** slide 02. A tese do relatório em 3 pilares + leitura final.

```html
<section class="slide">
  <img class="logo" src="assets/elven-logo.png" alt="Elven" />
  <div class="content">
    <div class="kicker">Resumo executivo</div>
    <h2>A tese principal, em até duas linhas.</h2>
    <div class="three-col">
      <div class="panel"><h3>1. Primeiro pilar</h3><p>Explicação com o dado que sustenta.</p></div>
      <div class="panel"><h3>2. Segundo pilar</h3><p>…</p></div>
      <div class="panel"><h3>3. Terceiro pilar</h3><p>…</p></div>
    </div>
    <div class="callout light"><strong>Leitura final:</strong> frase que costura os três pilares.</div>
  </div>
  <div class="source">Período analisado.</div>
</section>
```

---

## R3 — Linha do tempo

**Quando:** narrar uma janela em fases. Variante `dark`. Até 6 marcos.

```html
<section class="slide dark">
  <img class="logo on-dark" src="assets/elven-logo.png" alt="Elven" />
  <div class="content">
    <div class="kicker">Linha do tempo</div>
    <h2>Frase curta que dá o arco da história.</h2>
    <div class="timeline">
      <div class="tl-item hot">
        <div class="tl-time">00h-00h</div>
        <div class="tl-title">Título do marco</div>
        <div class="tl-copy">O que aconteceu, em uma ou duas linhas.</div>
      </div>
      <!-- marcadores: classe vazia (teal), .hot (vermelho), .warn (âmbar) -->
    </div>
  </div>
  <div class="source">Observação metodológica.</div>
</section>
```

---

## R4 — Dois gráficos lado a lado

**Quando:** comparar duas séries de dados. `two-col` com dois `chart-card`.

```html
<div class="content">
  <div class="kicker">Categoria</div>
  <h2>Headline que diz o que os gráficos provam juntos.</h2>
  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title"><strong>Título do gráfico</strong><span>séries</span></div>
      <div class="chart" id="chart-a"></div>
      <div class="note">O que observar.</div>
    </div>
    <div class="chart-card"> … <div class="chart" id="chart-b"></div> … </div>
  </div>
</div>
```

Defina os dados em `renderCharts()` (ver Passo 6 do SKILL.md).

---

## R5 — Gráfico + evidências

**Quando:** um gráfico forte + 3 evidências numéricas. `score-grid` (1.2fr / 0.8fr).

```html
<div class="content">
  <div class="kicker">Ponto de análise</div>
  <h2>Headline que diz o que o gráfico prova.</h2>
  <div class="score-grid">
    <div class="chart-card">
      <div class="chart-title"><strong>Título</strong><span>séries</span></div>
      <div class="chart" id="chart-x"></div>
      <div class="note">Legenda.</div>
    </div>
    <div>
      <div class="evidence-row" style="grid-template-columns: 1fr; margin-top: 0;">
        <div class="evidence hot"><div class="big">dado</div><div class="small">Evidência crítica.</div></div>
        <div class="evidence warn"><div class="big">dado</div><div class="small">Evidência de atenção.</div></div>
        <div class="evidence"><div class="big">dado</div><div class="small">Evidência positiva.</div></div>
      </div>
    </div>
  </div>
</div>
```

---

## R6 — Gráfico + código + interpretação

**Quando:** mostrar dado + trecho de código read-only + leitura. `score-grid`.

```html
<div class="score-grid">
  <div class="chart-card"> … <div class="chart" id="chart-y"></div> … </div>
  <div>
    <div class="code">funcao(args)
  passo 1
  retorno: x</div>
    <div class="callout light"><strong>Interpretação:</strong> o que o código significa operacionalmente.</div>
  </div>
</div>
```

---

## R7 — Diagrama causal + decisão

**Quando:** mostrar causalidade. Variante `dark`. `diagram` (nós + setas) + `decision`.

```html
<section class="slide dark">
  <img class="logo on-dark" src="assets/elven-logo.png" alt="Elven" />
  <div class="content">
    <div class="kicker">Causalidade</div>
    <h2>Como as camadas se combinam.</h2>
    <div class="diagram">
      <div class="node"><h3>Camada A</h3><p>Descrição.</p></div>
      <div class="arrow">+</div>
      <div class="node"><h3>Camada B</h3><p>Descrição.</p></div>
      <div class="arrow">+</div>
      <div class="node"><h3>Camada C</h3><p>Descrição.</p></div>
    </div>
    <div class="decision">
      <div class="yes"><h3>O que explica melhor</h3><p class="light-sub">…</p></div>
      <div class="no"><h3>O que não fecha sozinho</h3><p class="light-sub">…</p></div>
    </div>
  </div>
</section>
```

> Cards `.node`, `.decision .yes/.no` são brancos — o tema mantém o texto escuro mesmo em slide `dark`. Não force cor.

---

## R8 — Plano de ação (matriz)

**Quando:** tabela de ações priorizadas. `matrix`.

```html
<div class="content">
  <div class="kicker">Ações recomendadas</div>
  <h2>O próximo passo é fechar a causalidade e reduzir os riscos.</h2>
  <div class="matrix">
    <div class="matrix-row matrix-head">
      <div>Prazo</div><div>Ação</div><div>Evidência</div><div>Impacto</div>
    </div>
    <div class="matrix-row">
      <div><strong>Agora</strong></div>
      <div>Descrição da ação.</div>
      <div>Evidência que motivou.</div>
      <div class="risk high">Impacto esperado.</div>
    </div>
    <!-- .risk: .high (vermelho), .med (âmbar escuro), .low (teal) -->
  </div>
</div>
```

---

## R9 — Fechamento

**Quando:** último slide. `takeaways` em grade 2 colunas + callout de próximo passo.

```html
<div class="content">
  <div class="kicker">Conclusão e próximos passos</div>
  <h2>Frase-chave de encerramento.</h2>
  <div class="takeaways">
    <div class="takeaway">Primeiro ponto.</div>
    <div class="takeaway">Segundo ponto.</div>
    <!-- 4-6 takeaways -->
  </div>
  <div class="callout light"><strong>Próximo passo:</strong> a ação concreta recomendada.</div>
</div>
```

---

## Variantes de slide

| Variante | `class` | Quando |
|---|---|---|
| Light | `slide` | padrão — maioria dos slides |
| Dark | `slide dark` | timeline, diagrama, fechamento de impacto |
| Cover | `slide cover` | sempre o slide 01 (gradiente) |
| Split | `slide split-dark` | comparação lado a lado dark/light (raro) |

## Regras gerais

- Slide 01 sempre `cover`. Todo slide tem `.logo` + `.content` + `.kicker`.
- Headline diz a TESE do slide, não o tópico.
- Não invente classe CSS — componha com o catálogo (`component-catalog.md`).
- Falta um componente? Abra issue; não improvise.
