# Artifact contract

O que cada tipo de deck entrega como pacote. Lint estrutural cobre o HTML; este doc cobre o conjunto.

---

## `client-report-deck`

Pacote = **uma pasta** com o deck + suporte mínimo. Sem speaker notes, sem labs, sem agenda.

```
<slug>-<yyyy-mm-dd>/
├── <slug>.html              # deck source (HTML+CSS, 16:9, classes canônicas)
├── <slug>.pdf               # gerado por `decks-skill render`
├── source-notes.md          # de onde vieram os dados (logs, métricas, código)
├── qa-notes.md              # checklist visual+conteúdo passado antes de mandar
├── contact-sheet.png        # gerado por `decks-skill preview`
├── preview/                 # 1 PNG por slide (gerado por `preview`)
│   ├── slide-01.png
│   └── slide-NN.png
└── assets/                  # logos, charts SVG/PNG referenciados pelo HTML
```

### Conteúdo obrigatório do HTML

- Slide 01 = `class="slide cover"` com kicker `<CLIENTE>|<SUBCLIENTE> — <CONTEXTO>` (receita R1).
- Slide 02 = resumo executivo (receita R2: `three-col` de `.panel` + `.callout`).
- Slide final = fechamento (receita R9: `.takeaways` + `.callout` de próximo passo).
- Toda métrica numérica tem fonte declarada em `.source` OU em `source-notes.md`.
- Toda inspeção de código declara "read-only" em `.source`.

### `source-notes.md` — estrutura mínima

```markdown
# Source notes — <slug>

## Fontes brutas
- Loki: query `{env="prod", service="…"}`
- Prometheus: métrica `…`
- Audit logs: tabela `…`

## Trechos de código inspecionados (read-only)
- `ReservationQueueRetryLimiter.php:42-58`
- `OrdersRepository::verifyPaymentFormByOrderId`

## Janela temporal
- 07/05/2026 20:00 BRT → 08/05/2026 20:00 BRT

## Links Grafana
- Dashboard X: <url>
- Panel Y: <url>

## Hipóteses descartadas
- Hipótese A: descartada porque …
- Hipótese B: descartada porque …
```

### `qa-notes.md` — estrutura mínima

```markdown
# QA notes — <slug>

## Conteúdo
- [ ] Todas as métricas batem com `source-notes.md`?
- [ ] Janela temporal consistente em todos os slides?
- [ ] Nome do cliente correto?

## Visual
- [ ] Contact-sheet revisado, sem overflow?
- [ ] Numeração de página presente em todos os slides?
- [ ] Logo Elven canto superior direito em todos?

## Entrega
- [ ] Lint 10/10?
- [ ] PDF abre limpo em Preview.app + Adobe Reader?
- [ ] Nome do arquivo PDF segue convenção `<slug>.pdf`?
```

---

## `workshop-mentorship-deck`

Pacote = **árvore** com agenda + slides MD + HTML decks + labs + materials. Multi-dia.

```
<curso>/
├── README.md                            # front door
├── agenda/
│   ├── day-1.md
│   ├── day-2.md
│   └── day-N.md
├── slides/                              # narrativa source markdown (planning)
│   ├── day-1.md
│   └── day-N.md
├── html-slides/
│   ├── day-1.html                       # deck real (HTML+CSS, 16:9)
│   ├── day-N.html
│   ├── index.html                       # landing entre os dias
│   └── assets/
├── labs/
│   ├── shared-scenario.md
│   ├── day-1/lab.md
│   └── day-N/lab.md
└── materials/
    ├── instructor-guide.md
    ├── participant-pack.md
    ├── participant-email-template.md
    ├── queries-cheatsheet.md
    ├── official-2026-references.md
    └── speaker-notes/
        ├── day-1-script.md              # teleprompter contínuo
        ├── day-N-script.md
        ├── day-1/
        │   ├── 01-capa.md
        │   ├── 02-secao.md
        │   └── NN-encerramento.md
        └── day-N/
```

### Conteúdo obrigatório por arquivo

#### `agenda/day-X.md`

```markdown
# Dia X: Título

## Objetivo
## Resultado do dia
## Agenda de 90 minutos
### Bloco 1 — N min
### Bloco N — N min
## Fio condutor do instrutor
### Mensagem principal
## Lab do dia
## Fechamento ideal
```

#### `labs/day-X/lab.md`

```markdown
# Lab — Dia X

## O que se prova
## Pré-requisitos
## Execução
## Sucesso (output esperado)
## Falhas esperadas (e como debugar)
## Debrief
```

#### `materials/speaker-notes/day-X/NN-slug.md`

4 seções obrigatórias na ordem exata:

```markdown
# Slide NN — Título do slide

## Objetivo do slide
## Fala pronta
## Interação opcional
## Versão curta
```

Spec detalhada em `speaker-notes-spec.md`.

#### `materials/speaker-notes/day-X-script.md`

Teleprompter contínuo do dia inteiro, costurando todas as speaker notes. Sem meta-comentário. Cabeçalhos por bloco/slide pra navegação.

### Coerência

Quando muda um destes, **olhe todos**:

- nome real de app (`node-app`, `python-app`, `node-lambda-manual`)
- comando (`make smoke-local`)
- env var (`OTEL_EXPORTER_OTLP_ENDPOINT`)
- porta/protocolo (`:4318 OTLP`)
- service identity (`service.name`, `service.namespace`)
- contagem de slides ↔ contagem de speaker notes

Se o slide diz uma coisa e o lab diz outra, o pacote **não está pronto**.

---

## Coerência cross-tipo

Os dois tipos compartilham:

- **Brand visual** (tokens em `brand-tokens.md`)
- **Receitas de slide** (`slide-recipes.md`)
- **Componentes do tema** (`component-catalog.md`)
- **Editorial voice** (`editorial-voice.md`)
- **Lint binário** (10 regras, todas aplicáveis)

A diferença está nos artefatos companheiros.
