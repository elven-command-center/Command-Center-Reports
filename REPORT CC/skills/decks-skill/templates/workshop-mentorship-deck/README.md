# `<Curso>` - Mentoria Elven Works

Pacote canônico de mentoria/workshop multi-dia.

## Escopo

`<descrição em 2-3 frases do curso, audiência alvo, formato>`

## Cadência

- **Dia 1**: `<tema>`
- **Dia 2**: `<tema>`
- **Dia N**: `<tema>`

## Estrutura do pacote

| Pasta | Conteúdo |
|---|---|
| `agenda/` | objetivo + agenda 90min por dia |
| `slides/` | narrativa source markdown (planning) |
| `html-slides/` | decks reais 16:9, HTML + CSS |
| `labs/` | roteiros hands-on por dia + cenário compartilhado |
| `materials/` | instructor guide, participant pack, speaker notes, scripts |

## Como usar

1. Edite `agenda/day-1.md` (objetivo, agenda, fechamento)
2. Edite `slides/day-1.md` (narrativa markdown, planning)
3. Edite `html-slides/day-1.html` (deck real)
4. Crie `labs/day-1/lab.md` (hands-on)
5. Crie `materials/speaker-notes/day-1/01-capa.md`, `02-secao.md`, … (4 seções cada)
6. Crie `materials/speaker-notes/day-1-script.md` (teleprompter)
7. Repita pros próximos dias
8. `decks-skill lint html-slides/day-1.html` → 10/10
9. `decks-skill preview html-slides/day-1.html` + revisar contact-sheet
10. `decks-skill render html-slides/day-1.html` → PDF

## Personas alvo

- `turma-mentoria`
- `instrutor-elven`
- `agente-ia` (ao revisar speaker notes / labs)

## Ambiente real

`<descrição do ambiente, repos, demos usados>`
