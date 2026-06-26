# setup-skill.ps1 — verifica e instala a elven-decks-skill
#
# Rode UMA vez após clonar / mover o projeto.
# Nas próximas sessões a skill já está disponível — não precisa rodar de novo.

$SKILL_SRC  = "$PSScriptRoot\elven-decks-main\skill"
$SKILL_DEST = "$env:USERPROFILE\.claude\skills\decks-skill"

Write-Host "`n=== elven-decks-skill setup ===" -ForegroundColor Cyan

# 1. Verificar se a skill já está instalada
$installed = Test-Path "$SKILL_DEST\SKILL.md"
$puppeteer = Test-Path "$SKILL_DEST\node_modules\puppeteer"

if ($installed -and $puppeteer) {
    Write-Host "[OK] Skill instalada em: $SKILL_DEST" -ForegroundColor Green
    Write-Host "[OK] Puppeteer (render PDF) disponivel" -ForegroundColor Green
    Write-Host "`nNada a fazer. Pronto para gerar decks." -ForegroundColor Green
    exit 0
}

# 2. Instalar skill (copia skill/ -> ~/.claude/skills/decks-skill/)
if (-not $installed) {
    Write-Host "[...] Copiando skill para $SKILL_DEST" -ForegroundColor Yellow
    if (-not (Test-Path "$env:USERPROFILE\.claude\skills")) {
        New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills" | Out-Null
    }
    Copy-Item $SKILL_SRC $SKILL_DEST -Recurse -Force
    Write-Host "[OK] Skill copiada" -ForegroundColor Green
}

# 3. Instalar puppeteer (necessário para render PDF)
if (-not $puppeteer) {
    Write-Host "[...] Instalando puppeteer (necessario para render PDF)..." -ForegroundColor Yellow
    npm install --prefix $SKILL_DEST puppeteer
    Write-Host "[OK] Puppeteer instalado" -ForegroundColor Green
}

Write-Host "`n=== Setup concluido. Pronto para gerar decks. ===" -ForegroundColor Cyan
