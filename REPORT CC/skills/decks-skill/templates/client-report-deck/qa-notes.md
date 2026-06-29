# QA notes - `<slug>`

Bata item a item antes de mandar o deck ao cliente.

## Conteúdo

- [ ] Todas as métricas batem com `source-notes.md`?
- [ ] Janela temporal consistente em todos os slides?
- [ ] Nome do cliente correto no slide 01 (cover)?
- [ ] Subcliente / contexto correto no eyebrow?
- [ ] Acrônimos desenvolvidos na primeira menção?
- [ ] Headlines não passam de 3 linhas?

## Visual

- [ ] `decks-skill preview deck.html` rodado
- [ ] `contact-sheet.png` revisado, sem overflow
- [ ] Numeração de página `01, 02, …` presente em todos os slides
- [ ] Logo Elven canto superior direito em todos
- [ ] Slide 01 é `class="slide cover"` (gradiente teal/blue)
- [ ] Slide final é o fechamento (`.takeaways` + callout)

## Lint / Render

- [ ] `decks-skill lint deck.html` → 10/10 exit 0
- [ ] `decks-skill render deck.html` produz PDF sem erro
- [ ] PDF abre limpo em Preview.app (macOS)
- [ ] PDF abre limpo em Adobe Reader (cliente Windows)

## Entrega

- [ ] Nome do PDF: `<slug>.pdf`
- [ ] Pasta zipada se for mandar via canal externo
- [ ] Cliente notificado com link/anexo
