# BLIP — NOC Command Center

Projeto de monitoramento operacional da organização **Blip** via Power BI e relatórios periódicos do NOC.

---

## Estrutura do projeto

```
BLIP/
├── Dashboard/
│   └── Métricas NOC - BLIP.pbix        — dashboard Power BI
├── elven-decks-main/                    — código-fonte da skill de decks
├── Relatórios/
│   ├── _template-noc/                   — TEMPLATE PADRÃO (base para novos decks)
│   │   └── deck.html
│   ├── noc-blip-DDMMAAAA/              — um deck por dia
│   │   ├── Relatorio_NOC_Blip_DDMMAAAA.docx
│   │   ├── deck.html
│   │   ├── elven-deck.css
│   │   ├── elven-deck-charts.js
│   │   ├── noc-blip-DDMMAAAA.pdf
│   │   ├── source-notes.md
│   │   ├── qa-notes.md
│   │   └── assets/
└── setup-skill.ps1                      — verifica/instala a skill
```

---

## Skill de geração de decks

- **Instalada em**: `C:\Users\PC\.claude\skills\decks-skill\`
- **Fonte (este projeto)**: `elven-decks-main\skill\`
- **Para verificar/reinstalar**: rodar `.\setup-skill.ps1`
- **Puppeteer** (render PDF): já instalado em `~/.claude/skills/decks-skill/node_modules/`

---

## Workflow — gerar deck para um novo dia

> Use este fluxo SEMPRE que chegar um novo `.docx` de relatório NOC.

### 1. Extrair texto do .docx

```python
# usar `python` (não python3) no Windows
import zipfile, re, sys
path = "Relatorio_NOC_Blip_DDMMAAAA.docx"
with zipfile.ZipFile(path) as z:
    with z.open("word/document.xml") as f:
        xml = f.read().decode("utf-8")
text = re.sub(r"<[^>]+>", " ", xml)
text = re.sub(r"\s+", " ", text).strip()
print(text)
```

### 2. Criar pasta e copiar assets

```powershell
$slug = "noc-blip-DDMMAAAA"
$dst  = "Relatórios\$slug"
New-Item -ItemType Directory -Force $dst
New-Item -ItemType Directory -Force "$dst\assets"
# O _template-noc é a fonte canônica: já traz deck.html, CSS corrigido, JS e o logo command-center.
Copy-Item "Relatórios\_template-noc\*"        "$dst\" -Recurse -Force
```

### 3. Editar deck.html com os dados reais

Substituir todos os marcadores `{{...}}` no `deck.html` copiado do template:

| Marcador | O que é |
|---|---|
| `{{DATA_EXIBICAO}}` | ex: `23/06/2026` |
| `{{DATA_SLUG}}` | ex: `23062026` |
| `{{TOTAL_EVENTOS}}` | ex: `1.351` |
| `{{MTTA}}` | ex: `00:14:22` |
| `{{MTTR}}` | ex: `00:42:43` |
| `{{TAXA_RESOLUCAO}}` | ex: `97%` |
| `{{RESOLVIDOS}}` | ex: `1.307` |
| `{{SEV1_QTD}}` | ex: `283` |
| `{{SEV1_PCT}}` | ex: `21%` |
| `{{NOT_CLASS_QTD}}` | ex: `1.068` |
| `{{NOT_CLASS_PCT}}` | ex: `79%` |
| `{{ACK_RESOLVIDO}}` | ex: `756` |
| `{{ACK_RESOLVIDO_PCT}}` | ex: `55,9%` |
| `{{RESOLVIDO_SEM_ACK}}` | ex: `551` |
| `{{RESOLVIDO_SEM_ACK_PCT}}` | ex: `40,8%` |
| `{{ACK_SEM_RESOLUCAO}}` | ex: `41` |
| `{{ACK_SEM_RESOLUCAO_PCT}}` | ex: `3,0%` |
| `{{SEM_ACK_SEM_RES}}` | ex: `3` |
| `{{SEM_ACK_SEM_RES_PCT}}` | ex: `0,2%` |

### 4. Lint

```bash
bash ~/.claude/skills/decks-skill/scripts/lint.sh Relatórios/<slug>/deck.html
# Esperado: 9/10 (L10 é falso positivo no Windows — python3 ausente)
```

### 5. Render PDF

```powershell
node "C:\Users\PC\.claude\skills\decks-skill\scripts\render-deck.js" `
  "Relatórios\<slug>\deck.html" `
  --out "Relatórios\<slug>\<slug>.pdf"
```

### 6. Mover o .docx original para a pasta do deck

```powershell
Move-Item "Relatorio_NOC_Blip_DDMMAAAA.docx" "Relatórios\<slug>\"
```

---

## Template de referência

O arquivo `Relatórios/_template-noc/deck.html` é o padrão canônico.
Estrutura: **6 slides** — Capa · Resumo executivo · Status (dark) · Volume · Alertas em aberto · Próximos passos.

**Deck de referência visual**: `Relatórios/noc-blip-23062026/` (23/06/2026).

---

## Notas operacionais

- `python` (não `python3`) no terminal Windows
- L10 do lint é falso positivo no Windows — não bloquear o workflow por isso
- MTTR e MTTA no formato `HH:MM:SS`
- Coluna de tempo na tabela de alertas: **TTR acumulado** (padrão do dia 23)
- Kicker do slide de alertas: **"Alertas criticos em aberto"** (padrão do dia 23)
