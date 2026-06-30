# Command Center — NOC Multi-cliente

Monitoramento operacional consolidado da **Elven Works** via decks visuais gerados a partir do banco de dados `data_warehouse` (PostgreSQL).

---

## Estrutura do projeto

```
COMMAND CENTER/
├── Relatórios/
│   ├── _template-noc/                      — template base para novos decks
│   │   ├── deck.html
│   │   ├── elven-deck.css
│   │   ├── elven-deck-charts.js            — modificado localmente (rótulos de dados)
│   │   └── assets/
│   │       └── elven-logo.png
│   └── noc-multicliente-DDMMAAAA/          — um deck por período
│       ├── deck.html
│       ├── elven-deck.css
│       ├── elven-deck-charts.js
│       ├── noc-multicliente-DDMMAAAA.pdf
│       └── assets/
├── elven-decks-main/                       — código-fonte da skill de decks
├── CLAUDE.md                               — instruções do projeto para o Claude
├── README.md                               — este arquivo
└── setup-skill.ps1                         — verifica/instala a skill de decks
```

---

## Fonte de dados

| Campo | Valor |
|---|---|
| Host | `<DB_HOST>` (ver variável de ambiente / cofre de segredos) |
| Porta | `5432` |
| Banco | `data_warehouse` |
| Schema | `dbt_prd` |
| Tabela | `dsh__events_noc_investigation` |
| Coluna de data | `event_happened_tzbr` |

**Filtros obrigatórios em todas as queries:**
```sql
AND org_name NOT IN ('Blip', 'Unicred')
AND 'Time NOC - Elven' = ANY(responder_names)
```

> `responder_names` é uma coluna do tipo array no PostgreSQL — usar `= ANY()`, nunca `=` direto.

---

## Workflow — gerar deck para um novo período

### 1. Coletar dados (Python/psycopg2)

```python
import os
import psycopg2

conn = psycopg2.connect(
    host=os.environ['DB_HOST'],
    port=5432, dbname='data_warehouse',
    user=os.environ['DB_USER'],
    password=os.environ['DB_PASSWORD'], connect_timeout=15
)
cur = conn.cursor()
EXCL = "'Blip','Unicred'"
F    = "'Time NOC - Elven' = ANY(responder_names)"

# Totais do período
cur.execute(f"""
    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE event_type='alert'),
           COUNT(*) FILTER (WHERE event_type='incident'),
           COUNT(*) FILTER (WHERE is_ack=false)
    FROM dbt_prd.dsh__events_noc_investigation
    WHERE event_happened_tzbr >= 'YYYY-MM-DD'
      AND event_happened_tzbr < 'YYYY-MM-DD'
      AND org_name NOT IN ({EXCL}) AND {F}
""")
```

**Métricas coletadas:**
1. Totais (eventos, alertas, incidentes, sem ACK)
2. Volume por cliente (`org_name`)
3. Analistas com SLA não atingido — duas categorias:
   - **Sem ACK:** `is_ack = false`
   - **TTA > 15min:** `is_ack = true AND tta > 900`
4. IA Agente (`ai_touched = true`, `is_closed = true`)
5. Runbooks (`has_runbook = true`)
6. Recorrência (top 15 por `org_name, title`)
7. Perfil detalhado por cliente

### 2. Criar pasta e copiar assets

```powershell
$slug = "noc-multicliente-DDMMAAAA"
$dst  = "Relatórios\$slug"
New-Item -ItemType Directory -Force $dst
Copy-Item "Relatórios\_template-noc\*" "$dst\" -Recurse -Force
```

### 3. Editar deck.html com os dados reais

Substituir todos os marcadores `{{...}}` no `deck.html` copiado do template.

### 4. Renderizar PDF

```powershell
node "C:\Users\PC\.claude\skills\decks-skill\scripts\render-deck.js" `
  "Relatórios\<slug>\deck.html" `
  --out "Relatórios\<slug>\<slug>.pdf"
```

---

## Estrutura do deck (12 slides)

| # | Slide | Tipo |
|---|---|---|
| 01 | Capa | light |
| 02 | Resumo executivo | light |
| 03 | Comparativo diário | dark |
| 04 | Visão geral clientes | light |
| 05 | SLA não atingido | dark |
| 06 | Analistas SLA — resumo | light |
| 07 | Analistas SLA — detalhamento | dark |
| 08 | Volume de eventos | light |
| 09 | Recorrência dos eventos | dark |
| 10 | Runbooks + IA Agente | light |
| 11 | Perfil detalhado por cliente | light |
| 12 | Próximos passos | light |

---

## Correções de layout obrigatórias

Adicionar no `<style>` do `<head>` de cada deck gerado:

```css
/* score-grid — ausente do elven-deck.css base */
.score-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 30px; margin-top: 28px; }

/* matrix-wide: 6 colunas — slide visão geral clientes */
.matrix-wide .matrix-row      { grid-template-columns: 1.7fr 0.55fr 0.55fr 0.65fr 0.65fr 0.6fr; }
.matrix-wide .matrix-row > div { padding: 7px 9px; font-size: 12px; line-height: 1.2; }
.matrix-wide .matrix-head > div { font-size: 10px; padding: 7px 9px; }

/* matrix-detail: 7 colunas — slide perfil detalhado */
.matrix-detail .matrix-row      { grid-template-columns: 1.6fr 0.42fr 0.5fr 0.42fr 0.52fr 0.44fr 0.52fr; }
.matrix-detail .matrix-row > div { padding: 6px 7px; font-size: 11px; line-height: 1.2; }
.matrix-detail .matrix-head > div { font-size: 9px; padding: 6px 7px; letter-spacing: 1px; }

/* badges de risco */
.badge { display: inline-block; padding: 2px 7px; font-size: 10px; font-weight: 800; border-radius: 2px; }
.badge.alto  { background: rgba(255,82,82,.15);  color: #ff5252; }
.badge.medio { background: rgba(251,191,36,.15); color: #b45309; }
.badge.baixo { background: rgba(0,191,165,.15);  color: #00897b; }

/* evitar conteúdo vazando para o rodapé */
.slide .content { overflow: hidden; }

/* logo */
.logo { width: 148px !important; }
```

**Logo em slides dark:** adicionar `style="filter:brightness(0) invert(1);"` na tag `<img class="logo">`.

---

## Rótulos de dados nas barras

No `elven-deck-charts.js` local, dentro do `series.data.forEach` do `barChart`, após o bloco `<rect>`:

```js
var labelY = yv - 6;
var labelFill = dark ? "rgba(255,255,255,.88)" : "#0f1923";
if (labelY < p.t + 14) { labelY = yv + 15; labelFill = "#fff"; }
svg += '<text x="' + cx + '" y="' + labelY +
  '" text-anchor="middle" font-size="12" font-weight="800" fill="' + labelFill + '">' +
  fmt(v) + '</text>';
```

---

## Skill de geração de decks

- **Instalada em:** `C:\Users\PC\.claude\skills\decks-skill\`
- **Fonte:** `elven-decks-main\skill\`
- **Verificar/reinstalar:** `.\setup-skill.ps1`
- **Puppeteer:** já instalado em `~/.claude/skills/decks-skill/node_modules/`

---

## Padrão de nomenclatura

- Título do deck: **"Command Center Multi-cliente"** (não "NOC")
- Rodapé dos slides: **não** incluir "Gerado via Claude Code"
- Pasta: `Relatórios\noc-multicliente-DDMMAAAA\`
- PDF: `noc-multicliente-DDMMAAAA.pdf`
- Períodos múltiplos: deck único consolidado com slide comparativo diário (slide 03)

---

## Deck de referência

`Relatórios/noc-multicliente-24-25-062026/` — período 24/06 a 25/06/2026, 449 eventos, 12 clientes, Time NOC - Elven.
