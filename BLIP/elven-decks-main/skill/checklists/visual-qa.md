# Visual QA checklist

Roda **DEPOIS de `decks-skill preview`** com o `contact-sheet.png` aberto. Não basta o lint binário — esses são problemas que só olhos pegam.

## Frame e canvas

- [ ] Todo slide cabe no canvas 1280×720 sem clipping
- [ ] Nenhum conteúdo escapa pra fora do `padding` do slide (default 64/72px)
- [ ] Nenhum card está cortado na lateral direita ou inferior

## Tipografia

- [ ] Headlines com no máximo 3 linhas
- [ ] Eyebrows com no máximo 30 chars (~3 palavras)
- [ ] Subheads (quando presentes) com no máximo 2 linhas
- [ ] Texto de card em 13px, line-height 1.5, legível à distância

## Cores e contraste

- [ ] Texto branco sobre fundo claro? **Erro** — só permitido em `.slide.dark` ou `.slide.cover`
- [ ] Texto cinza médio (muted) sobre cinza claro? Verificar legibilidade — re-skin pra `--muted-strong` se duvidoso
- [ ] Teal usado só como accent (kicker, callout, tag, KPI, KPI positivo, card top-accent is-good)
- [ ] Red usado só pra semântica negativa (KPI negativo, card is-bad, alerta)
- [ ] Amber só pra warning (KPI atenção, card is-warn)
- [ ] Sem teal/red/amber decorativo aleatório

## Composição

- [ ] Cards do mesmo grid têm altura uniforme (não há card 30% mais alto que os outros)
- [ ] Gráficos e charts têm `alt` text descritivo
- [ ] Code panels não passam de 12 linhas (cortando narrativa)
- [ ] Callout banners aparecem **abaixo** dos cards principais, não no meio
- [ ] Timeline tem 3-5 marcos, dots alternando above/below

## Cover (slide 01)

- [ ] Gradient teal/blue cobre todo o canvas
- [ ] Eyebrow `CLIENTE | EVENTO — CONTEXTO` legível em branco
- [ ] Headline (`.is-large`) ocupa máximo 4 linhas
- [ ] KPI band (se presente) com 4 items, valores legíveis em branco
- [ ] Logo Elven canto superior direito
- [ ] `.source` no canto inferior esquerdo se há fonte/autor a declarar

## Closing (último slide)

- [ ] Slide de fechamento: `.takeaways` + callout de próximo passo
- [ ] Takeaways em grid 2-col, 3-6 items
- [ ] Bloco `.next` presente com `<strong>Próximo:</strong>` teal
- [ ] Headline `.is-large` curto e memorável

## Logo e numeração

- [ ] `.logo` no canto superior direito em **todo** slide
- [ ] Page number `01, 02, …` no canto inferior direito em **todo** slide
- [ ] Page number visível em slides dark/cover (cinza claro semitransparente)

## Slide-a-slide

- [ ] Slide N tem ponte narrativa com N-1 e N+1?
- [ ] Slide N tem razão de existir (não é decorativo nem redundante)?
- [ ] Algum slide é "denso demais"? Quebrar em 2.

## Companion (workshop)

- [ ] Slide title bate com filename de speaker note (`Slide 01 — Capa` ↔ `01-capa.md`)
- [ ] Contagem de slides do HTML ↔ contagem de arquivos em `materials/speaker-notes/day-X/`
