---
name: feedback-deck-visual
description: Decisões visuais e de conteúdo aprovadas para os decks de relatório REPORT CC
metadata:
  type: feedback
---

# Deck Visual - Decisões Aprovadas

## Traços e pontuação

Usar `-` (hífen simples) em todos os textos do deck: títulos h1/h2, headlines, células de tabela, evidências.
**Nunca** usar `—` (em dash).

**Why:** O usuário corrigiu explicitamente após o primeiro relatório gerado com em dashes.
**How to apply:** Ao escrever qualquer texto no deck, substituir `—` por `-` antes de salvar.

## Kicker da capa

Sempre `COMMAND CENTER - Relatório Operacional` — sem espaçamento entre letras, sem `·`.

**Why:** O usuário corrigiu a versão `C O M M A N D   C E N T E R   ·   Relatório Operacional`.

## Badge de cliente

Label `CLIENTE` + nome do cliente em lime (#d7ff63), posicionado dentro do `.content` como primeiro filho, antes do kicker.

**Why:** `position: absolute` causou sobreposição com o kicker — confirmado em screenshot da sessão.

## Slides com dados ausentes (tabelas vazias)

Quando não há dados (ex: tags, alertas em aberto, recorrência em dia único):
- Células de tabela: usar `-` 
- Evidências `.big` sem dado numérico: usar `0` ou `-`
- Sempre incluir nota explicativa no `.note` do chart-card

## Uso de `N/A` vs `-`

- Células de tabela sem dado: `-`
- Métricas numéricas sem cálculo possível (ex: MTTA quando 0 ACKs): `N/A`
- MTTR e MTTA formatados: `HH:MM:SS` quando há dados, `N/A` quando não há
