---
name: project-report-cc
description: "Localização, estrutura de pastas e fluxo de geração dos relatórios do Command Center (REPORT CC)"
metadata: 
  node_type: memory
  type: project
  originSessionId: be38439e-d237-4b2d-8cfc-c5c062d09c40
---

# Projeto REPORT CC — Geração de Relatórios

## Localização dos relatórios

**Pasta de saída (destino final):**
`C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\REPORT CC\Relatórios\`

**Template base (copiar assets e CSS daqui):**
`C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\CLIENTES CROSS\Relatórios\_template-noc\`

**Skill de geração:**
`C:\Users\PC\OneDrive\Desktop\CLAUDE\COMMAND CENTER\REPORT CC\skills\elven-cc-data-analysis\`

## Padrão de slug e pasta

```text
cc-{cliente-kebab}-{DDMMAAAA}
Exemplo: cc-elven-works-20062026
```

## Fluxo completo

1. Perguntar: data → cliente → catálogo (3 perguntas em sequência)
2. Executar queries P1–P11 via ODBC (script Python em scratchpad)
3. Criar pasta: `REPORT CC\Relatórios\{slug}\`
4. Copiar assets do `_template-noc`: `elven-deck.css`, `elven-deck-charts.js`, `assets\*`
5. Gerar `deck.html` preenchido
6. Renderizar PDF: `node render-deck.js deck.html --out {slug}.pdf`
7. Entregar na pasta `REPORT CC\Relatórios\{slug}\`

**Nota:** O template original fica em `CLIENTES CROSS\Relatórios\_template-noc\`. A entrega final vai para `REPORT CC\Relatórios\`.

## Template da capa (estrutura final aprovada)

```html
<style>
  .cliente-badge { display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px; }
  .cliente-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
  .cliente-nome  { font-size: 28px; font-weight: 800; color: #d7ff63; line-height: 1; letter-spacing: -0.01em; }
</style>

<section class="slide cover">
  <img class="logo on-dark" src="assets/elven-command-center.png" alt="Elven" />
  <div class="content">
    <div class="cliente-badge">
      <div class="cliente-label">CLIENTE</div>
      <div class="cliente-nome">{{NOME_CLIENTE}}</div>
    </div>
    <div class="kicker">COMMAND CENTER - Relatório Operacional</div>
    <h1>{{HEADLINE_CAPA}}</h1>
    <p class="sub">Métricas operacionais da organização {{NOME_CLIENTE}} - {{TOTAL_EVENTOS}} eventos monitorados em {{DATA_EXIBICAO}}.</p>
  </div>
  <div class="metric-rail">
    <div class="metric"><div class="value">{{MTTR}}</div><div class="label">MTTR médio</div></div>
    <div class="metric"><div class="value">{{MTTA}}</div><div class="label">MTTA médio</div></div>
    <div class="metric"><div class="value">{{TOTAL_EVENTOS}}</div><div class="label">total de eventos</div></div>
    <div class="metric"><div class="value">{{TAXA_RESOLUCAO}}</div><div class="label">taxa de resolução</div></div>
  </div>
  <div class="source">{{DATA_EXIBICAO}}</div>
</section>
```

**Regras da capa:**

- Badge dentro do `.content` como primeiro filho — nunca `position: absolute` (causa overlap com o kicker)
- Kicker fixo: `COMMAND CENTER - Relatório Operacional`
- Usar `-` (hífen), nunca `—` (em dash) em qualquer texto do deck

## Render script

```powershell
node "C:\Users\PC\.claude\skills\decks-skill\scripts\render-deck.js" "$dst\deck.html" --out "$dst\{slug}.pdf"
```

**Why:** O usuário moveu o relatório para REPORT CC\Relatórios — essa é a pasta oficial de entrega.
**How to apply:** Sempre gerar e entregar relatórios nessa pasta. Não usar CLIENTES CROSS\Relatórios como destino final.
