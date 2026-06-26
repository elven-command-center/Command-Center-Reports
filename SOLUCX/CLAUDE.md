# SOLUCX — NOC Command Center

Projeto de monitoramento operacional da organização **Solucx** via Power BI e relatórios periódicos do NOC.

---

## Estrutura do projeto

```
SOLUCX/
├── Dashboard/
│   └── Métricas NOC - SOLUCX.pbix        — dashboard Power BI
├── elven-decks-main/                    — código-fonte da skill de decks
├── Relatórios/
│   ├── _template-noc/                   — TEMPLATE PADRÃO (base para novos decks)
│   │   └── deck.html
│   ├── noc-solucx-DDMMAAAA/              — um deck por dia
│   │   ├── Relatorio_NOC_Solucx_DDMMAAAA.docx
│   │   ├── deck.html
│   │   ├── elven-deck.css
│   │   ├── elven-deck-charts.js
│   │   ├── noc-solucx-DDMMAAAA.pdf
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

> **GATILHO:** Quando o usuário disser **"execute o relatório"** (ou "relatório", "relatório do dia X"),
> SEMPRE pergunte primeiro **"Qual a data do relatório?"** e aguarde a resposta — não assumir a data de hoje.
> Após a resposta, executar TODO o workflow abaixo de forma autônoma, sem pedir confirmação a cada etapa
> (ver memória `feedback-autonomia-noc-report`).

> Use este fluxo SEMPRE que chegar um novo `.docx` de relatório NOC — ou gere direto do
> Data Warehouse via ODBC quando não houver `.docx` (ver memória `reference-odbc-datawarehouse`).

### 1. Extrair texto do .docx

```python
# usar `python` (não python3) no Windows
import zipfile, re, sys
path = "Relatorio_NOC_Solucx_DDMMAAAA.docx"
with zipfile.ZipFile(path) as z:
    with z.open("word/document.xml") as f:
        xml = f.read().decode("utf-8")
text = re.sub(r"<[^>]+>", " ", xml)
text = re.sub(r"\s+", " ", text).strip()
print(text)
```

### 2. Criar pasta e copiar assets

```powershell
$slug = "noc-solucx-DDMMAAAA"
$dst  = "Relatórios\$slug"
New-Item -ItemType Directory -Force $dst
New-Item -ItemType Directory -Force "$dst\assets"
# O _template-noc é a fonte canônica: já traz deck.html, CSS corrigido, JS e o logo.
Copy-Item "Relatórios\_template-noc\*"        "$dst\" -Recurse -Force
```

> O `_template-noc` agora carrega `elven-deck.css` (com as regras `.score-grid`, `.slide.vcenter`
> e os ajustes de `.matrix-row`), `elven-deck-charts.js` e `assets\elven-command-center.png`.
> Copiar a pasta inteira garante o padrão visual sem depender de decks antigos.

### 3. Editar deck.html com os dados reais

Substituir todos os marcadores `{{...}}` no `deck.html` copiado do template:

**Slide 01 — Capa**
| Marcador | O que é |
|---|---|
| `{{DATA_EXIBICAO}}` | ex: `23/06/2026` |
| `{{DATA_EXIBICAO_CURTA}}` | ex: `23/06` |
| `{{DATA_SLUG}}` | ex: `23062026` |
| `{{TOTAL_EVENTOS}}` | ex: `1.351` |
| `{{MTTR}}` | ex: `00:42:43` (MTTA foi removido do deck) |
| `{{TAXA_RESOLUCAO}}` | ex: `97%` |
| `{{HEADLINE_CAPA}}` | frase de impacto resumindo o dia |

**Slide 02 — Resumo executivo**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_RESUMO}}` | headline do slide |
| `{{TEXTO_VOLUME}}` | parágrafo sobre volume |
| `{{TEXTO_TEMPO}}` | parágrafo sobre MTTR e ACK (NÃO citar MTTA) |
| `{{TEXTO_CRITICIDADE}}` | parágrafo sobre sev-1 e clusters |
| `{{CALLOUT_RESUMO}}` | leitura final do dia |

**Slide 03 — Status dos eventos (dark)**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_STATUS}}` | headline do slide |
| `{{ACK_RESOLVIDO}}` | ex: `756` |
| `{{ACK_RESOLVIDO_PCT}}` | ex: `55,9%` |
| `{{RESOLVIDO_SEM_ACK}}` | ex: `551` |
| `{{RESOLVIDO_SEM_ACK_PCT}}` | ex: `40,8%` |
| `{{ACK_SEM_RESOLUCAO}}` | ex: `41` |
| `{{ACK_SEM_RESOLUCAO_PCT}}` | ex: `3,0%` |
| `{{SEM_ACK_SEM_RES}}` | ex: `3` |
| `{{SEM_ACK_SEM_RES_PCT}}` | ex: `0,2%` |
| `{{EVIDENCIA_SEM_ACK}}` | texto do card de evidência |
| `{{EVIDENCIA_ACK_PENDENTE}}` | texto do card de evidência |

**Slide 04 — Severidade**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_SEVERIDADE}}` | headline do slide |
| `{{SEV1_QTD}}` | ex: `283` (formatado com ponto) |
| `{{SEV1_PCT}}` | ex: `21%` |
| `{{SEV1_QTD_NUM}}` | ex: `283` (número puro para gráfico) |
| `{{NOT_CLASS_QTD}}` | ex: `1.068` (formatado) |
| `{{NOT_CLASS_PCT}}` | ex: `79%` |
| `{{NOT_CLASS_QTD_NUM}}` | ex: `1068` (número puro para gráfico) |
| `{{TTR30_QTD}}` | qtd de eventos com TTR > 30 min |
| `{{TTR30_PCT}}` | % do total |
| `{{NOTA_SEVERIDADE}}` | nota interpretativa do gráfico |

**Slide 05 — Volume de alertas**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_VOLUME}}` | headline do slide |
| `{{TOP5_DADOS}}` | ex: `239, 177, 95, 88, 76` |
| `{{TOP5_LABELS}}` | ex: `"Failure req Caramelo", "Pods restart LGTM", ...` |
| `{{NOTA_TOP5}}` | nota interpretativa |
| `{{TOP1_QTD}}` | qtd do 1º título |
| `{{EVIDENCIA_TOP1}}` | texto do card do 1º título |
| `{{TOP2_QTD}}` | qtd do 2º título |
| `{{EVIDENCIA_TOP2}}` | texto do card do 2º título |
| `{{TOP3_QTD}}` | qtd do 3º título |
| `{{EVIDENCIA_TOP3}}` | texto do card do 3º título |

**Slide 06 — Recorrência (dark)**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_RECORRENCIA}}` | headline do slide |
| `{{REC5_DADOS}}` | ocorrências dos top 5 recorrentes |
| `{{REC5_LABELS}}` | labels dos top 5 recorrentes |
| `{{NOTA_RECORRENCIA}}` | nota interpretativa |
| `{{REC1_TITULO}}` … `{{REC5_TITULO}}` | nome do alerta recorrente |
| `{{REC1_DIAS}}` … `{{REC5_DIAS}}` | qtd de dias em que apareceu |
| `{{REC1_TOTAL}}` … `{{REC5_TOTAL}}` | total de disparos acumulados |

**Slide 07 — Análise TTR prolongado**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_TTR}}` | headline do slide |
| `{{TTR5_DADOS}}` | qtd de eventos TTR>30min por título (top 5) |
| `{{TTR5_LABELS}}` | labels dos top 5 títulos com TTR longo |
| `{{NOTA_TTR}}` | nota interpretativa |
| `{{TTR_MAX}}` | maior TTR registrado ex: `108:25:55` |
| `{{EVIDENCIA_TTR_MAX}}` | nome do alerta com maior TTR |
| `{{TTR_CLUSTER_PRINCIPAL}}` | cluster com mais TTR longo |

**Slide 08 — Tags e contexto operacional**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_TAGS}}` | headline do slide |
| `{{TAG1_NOME}}` … `{{TAG5_NOME}}` | nome da tag |
| `{{TAG1_QTD}}` … `{{TAG5_QTD}}` | qtd de eventos |
| `{{TAG1_PCT}}` … `{{TAG5_PCT}}` | % do total |
| `{{TAG_INFRA_QTD}}` | qtd de eventos de infra (kubernetes, redis, etc.) |
| `{{EVIDENCIA_TAGS_INFRA}}` | texto interpretativo da tag de infra |
| `{{TAG_TOTAL_CATEGORIAS}}` | qtd de tags distintas no turno |

**Slide 09 — Alertas críticos em aberto (dark)**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_ALERTAS}}` | headline do slide |
| `{{ALERTA_N_NOME}}` | nome do alerta (N = 1..5) |
| `{{ALERTA_N_SEV}}` | severidade |
| `{{ALERTA_N_TTR}}` | TTR acumulado |
| `{{ALERTA_N_SERVICO}}` | serviço/cluster |
| `{{CALLOUT_ALERTAS}}` | ação recomendada |

**Slide 10 — Conclusão e próximos passos**
| Marcador | O que é |
|---|---|
| `{{HEADLINE_CONCLUSAO}}` | headline do slide |
| `{{TAKEAWAY_1}}` … `{{TAKEAWAY_4}}` | pontos de fechamento |
| `{{CALLOUT_CONCLUSAO}}` | próximo passo priorizado |

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
Move-Item "Relatorio_NOC_Solucx_DDMMAAAA.docx" "Relatórios\<slug>\"
```

---

## Template de referência

O arquivo `Relatórios/_template-noc/deck.html` é o padrão canônico.
Estrutura: **10 slides**:
1. Capa
2. Resumo executivo
3. Status dos eventos (dark) — matrix ACK/resolução
4. Severidade — sev-1 vs not-classified + TTR>30min
5. Volume de alertas — top 5 bar chart
6. Recorrência (dark) — títulos recorrentes com dias e total
7. Análise TTR prolongado — top 5 títulos com TTR>30min
8. Tags e contexto operacional — distribuição por categoria
9. Alertas críticos em aberto (dark) — top 5 por TTR acumulado
10. Conclusão e próximos passos

**Gráficos** (4 charts):
- `chart-severidade` — barChart sev-1 vs not-classified (cor: red)
- `chart-top-eventos` — barChart top 5 por volume (cor: teal)
- `chart-recorrencia` — barChart top 5 recorrentes (cor: orange)
- `chart-ttr` — barChart top 5 TTR>30min (cor: red)

**Deck de referência visual**: `Relatórios/noc-solucx-23062026/` (23/06/2026) — estrutura antiga de 6 slides, usar apenas para referência de CSS/assets.

---

## Notas operacionais

- `python` (não `python3`) no terminal Windows
- L10 do lint é falso positivo no Windows — não bloquear o workflow por isso
- MTTR no formato `HH:MM:SS` (MTTA foi removido do deck — não incluir em capa, resumo, conclusão ou qualquer slide)
- Coluna de tempo na tabela de alertas: **TTR acumulado** (padrão do dia 23)
- Kicker do slide de alertas: **"Alertas criticos em aberto"** (padrão do dia 23)

### Padrão de branding (locked no `_template-noc`)
- **Naming**: usar **"Command Center"**, nunca "NOC" (kicker, `<title>`, rodapés)
- **Logo**: `assets/elven-command-center.png` (lockup "elven COMMAND CENTER"), `.logo { width: 172px }` no CSS
- **Rodapé (`.source`)**: apenas o período do relatório (ex.: `{{DATA_EXIBICAO}}`) — sem descrição por slide
- **Sem** crédito "Gerado via Claude Code" em nenhum slide
- **Gráfico de recorrência (slide 6)**: cor verde `#34d399` (não orange)
- O `elven-deck.css` do template já inclui as regras `.score-grid`, `.slide.vcenter` e os ajustes de `.matrix-row` (3 colunas) — sem elas os slides 4–7 estouram
