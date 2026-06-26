# Speaker notes spec (workshop-mentorship-deck only)

Toda speaker note de slide em workshop precisa ter exatamente **4 seções na ordem exata**. Não é opcional, não é "use o que se aplica" — é o contrato.

---

## Estrutura

```markdown
# Slide NN — Título exato do slide

## Objetivo do slide

(1-2 frases declarando o que esse slide precisa instalar na cabeça da plateia.)

## Fala pronta

(Texto em pt-BR, primeira pessoa do singular ou plural, ritmo de fala real.
Pode ter 3-8 parágrafos. Tem que poder ser lido em voz alta sem refraseamento.
Sem meta-comentário. Sem "esse slide serve para…". Sem "o instrutor pode dizer…")

## Interação opcional

(Uma pergunta pra plateia, um momento de pausa, uma provocação. Se o slide
não pede interação, deixe a seção como:

> Sem interação proposta. Mantenha ritmo.

Não delete a seção — ela faz parte do contrato.)

## Versão curta

(1 frase resumindo tudo, pra usar quando o tempo está apertado.)
```

---

## Por que 4 seções

- **Objetivo do slide** — força o autor a justificar a existência do slide. Se você não consegue escrever o objetivo em 2 frases, o slide está errado.
- **Fala pronta** — onde a profundidade vive. O slide é estrutura+memória; a speaker note é a aula.
- **Interação opcional** — força o instrutor a pensar em ritmo. Workshop sem interação vira monólogo.
- **Versão curta** — backup pra quando o cronômetro aperta. Salva sessão real.

Pular qualquer uma delas perde uma função crítica.

---

## Anti-patterns

**Meta-tom no `## Fala pronta`:**

```markdown
## Fala pronta

Esse slide serve para mostrar que o runtime é importante. Você pode dizer
que sem instrumentação a observabilidade não acontece.
```

**Errado.** Vai virar fala robótica. Refaça:

```markdown
## Fala pronta

A maioria das equipes que vê telemetria boa em Kubernetes pela primeira vez
acha que isso é mágica do cluster. Não é. É instrumentação. E o motivo de
hoje a gente sair do K8s é exatamente esse: quando você não tem operator
empurrando o runtime, o que sobra é o que você escreveu.
```

---

**Bullet de tarefa no `## Fala pronta`:**

```markdown
## Fala pronta

- Apresentar runtime
- Mostrar bootstrap
- Explicar otel-collector
- Encerrar
```

**Errado.** Vira lista de checklist, não fala. Refaça com parágrafos.

---

**Seção `## Interação opcional` deletada:**

```markdown
# Slide 03 — Bootstrap Node

## Objetivo do slide
…

## Fala pronta
…

## Versão curta
…
```

**Errado.** O contrato é 4 seções. Se não há interação, escreva "Sem interação proposta."

---

## Script teleprompter (day-X-script.md)

Cobertura: o dia inteiro, costurando todas as speaker notes.

```markdown
# Script Dia X — <Curso>

## Slide 01 — Capa

(Fala pronta integral do slide 01.)

## Slide 02 — Seção

(Fala pronta integral do slide 02.)

## Transição

(Frase explicitando passagem entre blocos. Não é parte do slide.)

## Slide 03 — …
```

- Cabeçalhos por slide pra navegação.
- Pode incluir **transições explícitas** entre blocos.
- **Sem meta-comentário**.
- Pode reusar a `Fala pronta` ipsis litteris OU reescrever costurando.

---

## Como o lint trata speaker notes em v0.1

Lint binário v0.1.0 **não inspeciona speaker notes** ainda — só o HTML do deck. Validação manual via `quality-gate.md` G4.

Roadmap pós-v0.1: lint de speaker notes (markdownlint custom rule) que checa as 4 seções obrigatórias. Issue: rastreamento futuro.

---

## Exemplo canônico

Veja `Mentoring/materials/speaker-notes/day-2/01-capa.md` — exemplo real, em produção. Use como referência de tom e densidade.
