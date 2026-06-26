# Editorial voice

Tom e ritmo de escrita pra deck Elven. Não é estilo lúdico, não é tom corporativo plástico.

---

## Voz

Deve soar como:

- professor experiente, técnico, em controle do material
- maduro tecnicamente, sem medo de mostrar código
- humano e direto, sem rebuscar
- fácil de seguir mesmo pra plateia intermediária
- nunca corrido, plástico, ou genérico

A leitura do slide ou do PDF deve passar a sensação: "essa pessoa sabe o que está acontecendo".

---

## O que evitar

- **Filler genérico**: "É importante notar que…", "Como sabemos…", "Vamos falar sobre…"
- **Slides desconectados**: cada slide se sustenta sozinho mas tem ponte com o anterior e o próximo.
- **Meta-comentário visível**: "Esse slide serve para mostrar…", "Você pode dizer que…"
- **Texto que parece instrução interna**: "Aqui o instrutor deve…" → vai pra speaker note, não pro slide.
- **Buzzword sem operação**: "observability-driven cloud-native posture" ≠ frase com significado real.
- **Misturar metas de ensino e detalhe de implementação sem ponte**: "vamos entender traces" e em seguida `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=…` sem dizer o pulo.

---

## Regras pra título de slide (headline)

Bons títulos:

- **assertivos**: "A virada das 14h aponta para o fluxo de pedido e pagamento." (não "Análise da virada das 14h.")
- **causais**: "Runtime muda. Narrativa operacional não." (estabelece uma tese)
- **ligados ao ponto de ensino**: "O wrapper de retry decide com base em deadline e checagem Redis." (não "Sobre o wrapper de retry.")

Títulos fracos:

- vagos: "Análise geral"
- meta-classe: "Sobre observabilidade fora do K8s"
- excessivamente "espertos": "Quando o cluster vira inocente útil…" (joga curva, mas não ensina)
- excessivamente genéricos: "Vamos falar de runtime"

---

## Regra do apoio ao apresentador (workshop)

O slide visível é apoio do presenter, não o palestrante completo.

- menos palavras que speaker notes
- estrutura mais forte que o texto cru
- densidade alta só quando ainda lê em <8s
- code block curto e didático, não dump

A speaker note é onde a profundidade vive. O slide é onde estrutura e memória vivem.

---

## Ritmo narrativo

Numa sequência típica (dia de workshop OU report):

1. **enquadramento / tensão** — qual é o problema, por que importa hoje
2. **modelo mental** — como pensar nisso
3. **visão concreta do sistema** — onde isso aparece no runtime
4. **regras operacionais** — o que muda no dia-a-dia
5. **prova prática** — demo / dado real
6. **hands-on** (workshop) ou **análise profunda** (report)
7. **fechamento + ponte** — pro próximo dia ou pra ação concreta

Não precisa ser exato, mas slides devem se conectar.

---

## Balanço hands-on (workshop)

Anti-pattern frequente:

- Dia 1 sobrecarregado de teoria
- Dia 2 abstrato demais
- Dia 3 hands-on tarde demais pra importar

Todo dia precisa ter:

- ganho conceitual real
- prova prática
- sensação de progresso ao fechar

---

## Sobre versão/ano

Material de 2026 não pode ter `2025` solto. Se fala "última versão" ou "atual", confirme contra fonte oficial. Se diz "GA desde Q1/2026", confirme.

Em PR / review, esse é o gate G6 do `quality-gate.md`.

---

## Sobre código no deck

- Inline: `<code>` (variáveis, paths, comandos curtos).
- Bloco: `.code` em `<pre>`. Máximo ~12 linhas. Se for mais, está sobrando.
- Sintaxe highlight: **não há** em v0.1. O texto fica branco-azulado sobre `#0b1220`. Comentários inline use `# …` ou `// …` literal — não precisa estilizar.
- Sem `:` no fim de label de variável dentro do `.code`; siga a sintaxe da linguagem real.

---

## Sobre números

- Sempre dizer **fonte**: "Período 07/05 20:00 → 08/05 20:00 BRT, fonte: Loki ${env=prod}."
- Sempre dizer **timezone** se aparece hora: "13:47 BRT".
- KPIs grandes (cover, kpi-row): inclua **unidade** ou contexto (`+92%`, não `92`).
- Decimais: use vírgula em pt-BR (`12,5%`, não `12.5%`), exceto em código.

---

## Sobre nomes técnicos

- Nomes de variáveis, arquivos, classes, comandos: sempre em `<code>`.
- Nomes próprios de produtos/projetos: sem `<code>`, capitalização oficial (`Beyla`, `Tempo`, `Loki`, `Mimir`, `OpenTelemetry`, `Prometheus`).
- Acrônimos: na primeira menção, sempre desenvolva — "MTTD (mean time to detect)".
