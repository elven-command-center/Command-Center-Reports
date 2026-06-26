# Pre-deliver checklist

Antes de mandar ao cliente / palco. Bata item a item, sem pular. Se algum item não bate, **não termine**.

## Conteúdo

- [ ] Cliente / evento corretos no slide 01 (cover)
- [ ] Data e janela temporal corretas em todos os slides
- [ ] Toda métrica numérica tem fonte declarada (no slide ou em `source-notes.md`)
- [ ] Nenhuma alegação "atual/2026" sem confirmação de fonte oficial
- [ ] Nomes técnicos consistentes (variáveis, arquivos, comandos, env vars) entre slides
- [ ] Acrônimos desenvolvidos na primeira menção (ex: "MTTD (mean time to detect)")
- [ ] Headlines não passam de 3 linhas
- [ ] Eyebrows não passam de 30 chars
- [ ] (Workshop) Speaker notes existem para todos os slides
- [ ] (Workshop) Speaker notes têm as 4 seções obrigatórias
- [ ] (Workshop) Day script teleprompter está completo e foi lido em voz alta pelo menos 1 vez

## Visual

- [ ] Contact-sheet (`decks-skill preview`) revisado, sem overflow visual
- [ ] Numeração de página presente e legível em todos os slides
- [ ] Logo Elven no canto superior direito em todos os slides
- [ ] Slide 01 é `class="slide cover"` (gradiente teal/blue)
- [ ] Último slide é o fechamento (`.takeaways` + callout de próximo passo)
- [ ] Todo slide tem `.logo`, `.content` e `.kicker`
- [ ] Cores teal/red/amber só usadas onde semântica permite (sem decorativo aleatório)
- [ ] Nenhum emoji no corpo visível do deck (use `.tag` se precisar de badge)

## Acessibilidade

- [ ] `<html lang="pt-BR">` presente
- [ ] Imagens com `alt` descritivo
- [ ] Contraste de texto/fundo suficiente em cards dark
- [ ] Texto crítico não está só em cor (red/amber sempre acompanhado de texto)

## Render

- [ ] `decks-skill lint <deck>.html` retorna `10/10` exit 0
- [ ] `decks-skill render` produz PDF sem erro
- [ ] PDF abre limpo em Preview.app (macOS)
- [ ] PDF abre limpo em Adobe Reader (Windows/cliente)
- [ ] Nome do arquivo PDF segue convenção `<slug>.pdf`

## Companion artifacts (workshop)

- [ ] `agenda/day-X.md` tem objetivo + resultado + agenda 90min + fechamento
- [ ] `labs/day-X/lab.md` tem 6 seções obrigatórias (O que se prova / Pré-requisitos / Execução / Sucesso / Falhas esperadas / Debrief)
- [ ] `materials/instructor-guide.md` revisado
- [ ] `materials/participant-pack.md` revisado
- [ ] Lab roda do início ao fim sem stuck humano

## Companion artifacts (client-report)

- [ ] `source-notes.md` completo e linkado
- [ ] `qa-notes.md` batido item a item
- [ ] `preview/` gerado com todos os slides
- [ ] `contact-sheet.png` gerado

## Logístico

- [ ] PDF nomeado corretamente (sem espaços, kebab-case, com data se relevante)
- [ ] Pasta de entrega zipada se for mandar via canal externo
- [ ] Cliente notificado (email/Slack) com link ou anexo
- [ ] (Workshop) Participantes notificados com participant-pack 24h antes

## Gate final

- [ ] Re-leia os headlines em sequência: contam uma história sozinhos?
- [ ] Pergunta honesta: "Se isso vai pra plateia / cliente amanhã, o que ainda envergonha?" — se a resposta não é "nada", volte ao trabalho.
