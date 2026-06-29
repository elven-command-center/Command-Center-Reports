# Brand tokens (locked)

Tokens **imutáveis** do tema. Vivem em `themes/elven-deck.css` no `:root`. Drift de cor/fonte falha o lint (regra L3).

**Fonte canônica**: extraído verbatim do deck aprovado `kontik-zupper-incident-24h.html` - entregue a cliente real. Não foi inventado.

---

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#0f1923` | texto principal; fundo de `slide dark` |
| `--ink-2` | `#142638` | variante do ink (raro) |
| `--paper` | `#f4f7f8` | fundo do slide light (padrão) |
| `--white` | `#ffffff` | fundo de card; texto sobre dark |
| `--muted` | `#64748b` | metadata, numeração, `.source` |
| `--teal` | `#00bfa5` | accent primário - kicker (light), callout, tag, marcador |
| `--teal-2` | `#00897b` | teal escuro - kicker, gradiente da capa, `.arrow` |
| `--cyan` | `#00e5ff` | accent secundário - radial da capa |
| `--blue` | `#0d47a1` | gradiente da capa; série de gráfico |
| `--lime` | `#d7ff63` | kicker em slide dark/cover; marcador de takeaway dark |
| `--red` | `#ff5252` | erro, alerta, `.hot`, `.risk.high` |
| `--amber` | `#fbbf24` | atenção, `.warn` |
| `--violet` | `#7c3aed` | série extra de gráfico (raro) |
| `--line` | `rgba(15,25,35,0.14)` | borda fina de card |

**Regra de uso**: teal é o accent. Vermelho/âmbar são reservados para semântica negativa/atenção (`.hot`, `.warn`, `.risk`). Nunca decorativo.

---

## Tipografia

```css
--font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", ui-monospace, monospace;
```

System fallback intencional - sem `@font-face`. Inter e IBM Plex Mono são free; self-host é roadmap se algum cliente exigir lockdown de rede.

**Tamanhos canônicos** (no CSS - não improvise):

| Elemento | Tamanho | Peso |
|---|---|---|
| `h1` (capa) | 68px | 900 |
| `h2` (demais) | 42px | 900 |
| `h3` (card) | 20px | 850 |
| `.sub` | 22px | 400 |
| `.light-sub` | 18px | 400 |
| `.kicker` | 12px | 800, letter-spacing 3px |
| `.metric .value` | 34px | 900 |
| `.evidence .big` / `.tl-time` | 30 / 26px | 900 |
| `.code` / `.mono` | 12px / 0.9em | mono |
| `.source` | 10px | 400 |

---

## Frame

- Canvas: **1280×720** exato (16:9). `.slide { width: var(--w); height: var(--h) }`.
- Moldura editorial: `.content { position: absolute; inset: 52px 72px 54px 72px }`. Todo conteúdo mora aqui (exceto `.logo`, `.metric-rail`, `.source`).
- Numeração automática:

```css
body { counter-reset: slide; }
.slide { counter-increment: slide; }
.slide::after { content: counter(slide, decimal-leading-zero); }
```

Formato `01, 02 … 99`, canto inferior direito. Cor `--muted` em light, branco translúcido em dark/cover.

- Page break: cada `.slide` força `page-break-after: always` para o PDF.

---

## Variantes de slide

| Classe | Fundo | Texto | Quando |
|---|---|---|---|
| `slide` | `--paper` | `--ink` | padrão - maioria dos slides |
| `slide dark` | `#0f1923` | branco | timeline, diagrama, fechamento de impacto |
| `slide cover` | gradiente teal→blue + radiais | branco | slide 01 SEMPRE |
| `slide split-dark` | 48/52 dark→paper | misto | comparação lado a lado (raro) |

---

## Logo

- Sempre canto superior direito. Classe `.logo`. Largura **104px**.
- Arquivo canônico: `assets/elven-logo.png` - lockup vertical (ícone gradiente + wordmark "elven" em verde-escuro), fundo transparente.
- **Slide light**: logo colorido (como o PNG é).
- **`slide cover` e `slide dark`**: o CSS aplica `filter: brightness(0) invert(1)` automaticamente → logo 100% branco. Automático pela variante; não troca de arquivo.
- **Declaração explícita recomendada**: use `class="logo on-dark"` em slides dark/cover por clareza de leitura do HTML.
- **Escape hatch**: `.logo.on-dark` força branco, `.logo.on-light` força colorido - para casos de borda.
- Lint L9 exige `.logo` em **todo** slide.

---

## O que não pode ser alterado

Paleta, fontes, frame 1280×720, numeração, e o conjunto de componentes em `themes/elven-deck.css` são o contrato visual. Não duplique, não improvise variações. Precisa de algo novo? Abra issue antes.
