# Quality gate

Lint binário (10/10) é gate **estrutural**. Estes 6 gates são **qualitativos**. Não conclua o pacote sem bater os dois.

---

## G1 — Identidade visual

Abra o PDF rendered lado-a-lado com a referência canônica:

- **Client-report**: `kontik-zupper-incident-2026-05-08/kontik-zupper-incident-24h.pdf`
- **Workshop**: qualquer dia válido de `Mentoring/html-slides/day-*.html` (após migração visual; v0.1.0 ainda usa CSS antigo do workshop)

Checagens olho-no-olho:

- Cor do eyebrow é o mesmo teal `#00bfa5`
- Background é o mesmo `#f4f7f8`
- Fonte do headline parece Inter bold
- Espaçamento entre cards é consistente
- Logo no canto superior direito tem o mesmo tamanho
- Numeração de página `01, 02, …` no canto inferior direito

Se há drift visível, ajuste `themes/elven-deck.css` antes de seguir.

---

## G2 — Narrativa

- A sequência de slides forma uma história contínua
- Cada slide tem razão de existir (não é decorativo, não é redundante)
- Cada hands-on (workshop) é justificado pelo bloco teórico anterior
- O dia/deck fecha com uma ponte clara (próximo passo, próximo dia, próxima ação)

Teste: leia só os headlines em sequência. Eles contam uma história sozinhos?

---

## G3 — Coerência de artefato (workshop)

Verifique consistência entre:

- `slides/day-X.md` (planning) ↔ `html-slides/day-X.html` (deck real)
- `html-slides/day-X.html` ↔ `materials/speaker-notes/day-X/NN-*.md` (contagem + ordem)
- `agenda/day-X.md` ↔ `labs/day-X/lab.md` ↔ `materials/speaker-notes/day-X-script.md`
- `README.md` ↔ todos os dias (dias listados, datas, escopo)

Use `grep` pra checar nomes de apps/comandos/env vars repetidos. Se um arquivo diz `node-app` e outro diz `nodeapp`, é drift.

---

## G4 — Qualidade de fala (workshop)

- Speaker notes têm 4 seções (Objetivo / Fala pronta / Interação opcional / Versão curta)
- `## Fala pronta` é fala real, não meta-comentário
- Não tem "esse slide serve para…" ou "o instrutor pode dizer…" — esses são leak de tom
- Cada speaker note termina com transição implícita pro próximo (ou explícita no `day-X-script.md`)

Teste: pegue 1 speaker note aleatória. Você consegue **ler em voz alta** e parecer natural? Se não, refaça.

---

## G5 — QA visual

Rode `decks-skill preview <deck>.html` e abra `contact-sheet.png`. Verifique:

- Nenhum slide tem **overflow** (texto cortado, card além do canvas)
- Nenhum slide tem **contraste ruim** (texto branco sobre branco, cinza sobre cinza)
- Banner/callout não cobre card
- Eyebrow não está com 50+ chars
- Headlines não passam de 3 linhas
- Numeração de página visível em todos
- Logo visível em todos

Se ANY slide tem problema, fix antes de gerar PDF final.

---

## G6 — Fechamento honesto

A pergunta final:

> "Se eu mandar isso pro cliente / palco amanhã, o que ainda envergonha?"

Se a resposta é não-trivial, **não termine**.

Razões comuns:

- deck não foi visualmente revisado em browser real
- labs não batem com o repo real (workshop)
- speaker notes ainda parecem rascunho (workshop)
- referências de "atual"/"2026" não foram conferidas
- métricas no deck não batem com `source-notes.md` (client-report)
- cliente errado no cover (já aconteceu — confira)

Só termine quando tudo passa.

---

## Final acceptance ritual

Antes de mandar:

1. Lint 10/10 ✅
2. Preview contact-sheet revisado ✅
3. `pre-deliver.md` batido item a item ✅
4. PDF aberto em Preview.app **e** Adobe Reader (compatibilidade) ✅
5. Cliente/data/janela conferidos em `source-notes.md` ✅
6. (Workshop) script teleprompter lido em voz alta pelo menos 1 vez ✅
