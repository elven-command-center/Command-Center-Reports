#!/usr/bin/env node
/**
 * decks-skill — CLI
 *
 * Subcommands:
 *   install [--force]              Copies skill/* to ~/.claude/skills/decks-skill/
 *   update                         Same as install --force
 *   lint <file.html> [<file.html>]  Run skill/scripts/lint.sh against files
 *   render <file.html> [--out <out.pdf>]      HTML deck → PDF via Puppeteer
 *   preview <file.html> [--out-dir <dir>]     HTML deck → 1 PNG/slide + contact-sheet
 *   new <client-report|workshop> <slug>       Scaffold a fresh deck/package
 *   --version, -v                  Print package version
 *   --help, -h                     Print this help
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const PACKAGE_JSON = require(path.join(PACKAGE_ROOT, "package.json"));
const SKILL_SOURCE = path.join(PACKAGE_ROOT, "skill");
const SKILL_DEST = path.join(os.homedir(), ".claude", "skills", "decks-skill");

const args = process.argv.slice(2);
const cmd = args[0];

function log(msg) { process.stdout.write(`${msg}\n`); }
function err(msg) { process.stderr.write(`${msg}\n`); }

function printHelp() {
  log(`@elven-observability/decks-skill v${PACKAGE_JSON.version}

Uso:
  decks-skill install [--force]
      Copia skill/* para ~/.claude/skills/decks-skill/.
      Use --force para sobrescrever sem prompt.

  decks-skill update
      Equivalente a install --force.

  decks-skill lint <arquivo.html> [<arquivo.html>...]
      Roda lint binário 10/10. Exit 0 = todos passam; exit 1 = pelo menos 1 falha.

  decks-skill render <arquivo.html> [--out <arquivo.pdf>]
      Renderiza HTML deck → PDF (Puppeteer, 1280x720).
      Saída default: <arquivo>.pdf ao lado do .html.

  decks-skill preview <arquivo.html> [--out-dir <dir>]
      Gera 1 PNG por slide + contact-sheet.png.
      Saída default: <dirname-do-deck>/preview/ + <dirname>/contact-sheet.png

  decks-skill new <client-report|workshop> <slug>
      Cria scaffold a partir do template canônico.

  decks-skill --version | -v
      Imprime ${PACKAGE_JSON.version}.

  decks-skill --help | -h
      Imprime esta ajuda.

Documentação completa: https://github.com/elven-observability/elven-decks
`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      if (entry === ".DS_Store") continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
    if ((stat.mode & 0o111) !== 0) {
      fs.chmodSync(dest, stat.mode);
    }
  }
}

function promptYesNo(question) {
  if (!process.stdin.isTTY) {
    err("Sem TTY interativo. Use --force para sobrescrever sem prompt.");
    return false;
  }
  process.stdout.write(`${question} [s/N]: `);
  const buf = Buffer.alloc(8);
  try {
    const fd = fs.openSync("/dev/tty", "r");
    const n = fs.readSync(fd, buf, 0, 8, null);
    fs.closeSync(fd);
    const ans = buf.slice(0, n).toString().trim().toLowerCase();
    return ans === "s" || ans === "sim" || ans === "y" || ans === "yes";
  } catch {
    return false;
  }
}

function install({ force = false } = {}) {
  if (!fs.existsSync(SKILL_SOURCE)) {
    err(`Erro: ${SKILL_SOURCE} não existe. Reinstale o package.`);
    process.exit(1);
  }
  if (fs.existsSync(SKILL_DEST) && !force) {
    if (!promptYesNo(`${SKILL_DEST} já existe. Sobrescrever?`)) {
      log("Cancelado.");
      process.exit(0);
    }
  }
  ensureDir(path.dirname(SKILL_DEST));
  if (fs.existsSync(SKILL_DEST)) {
    fs.rmSync(SKILL_DEST, { recursive: true, force: true });
  }
  copyRecursive(SKILL_SOURCE, SKILL_DEST);

  const lintSh = path.join(SKILL_DEST, "scripts/lint.sh");
  if (fs.existsSync(lintSh)) fs.chmodSync(lintSh, 0o755);

  log(`Skill instalado em ${SKILL_DEST}`);
  log(`Próximo passo: abra uma nova sessão Claude Code e o skill aparecerá em /skills.`);
}

function lint(files) {
  if (files.length === 0) {
    err("Uso: decks-skill lint <arquivo.html> [<arquivo.html>...]");
    process.exit(2);
  }
  const script = path.join(PACKAGE_ROOT, "skill", "scripts", "lint.sh");
  if (!fs.existsSync(script)) {
    err(`Erro: ${script} não encontrado.`);
    process.exit(1);
  }
  const r = spawnSync("bash", [script, ...files], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}

function render(rest) {
  if (rest.length === 0) {
    err("Uso: decks-skill render <arquivo.html> [--out <arquivo.pdf>]");
    process.exit(2);
  }
  const script = path.join(PACKAGE_ROOT, "skill", "scripts", "render-deck.js");
  if (!fs.existsSync(script)) {
    err(`Erro: ${script} não encontrado.`);
    process.exit(1);
  }
  const r = spawnSync(process.execPath, [script, ...rest], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}

function preview(rest) {
  if (rest.length === 0) {
    err("Uso: decks-skill preview <arquivo.html> [--out-dir <dir>]");
    process.exit(2);
  }
  const script = path.join(PACKAGE_ROOT, "skill", "scripts", "preview-deck.js");
  if (!fs.existsSync(script)) {
    err(`Erro: ${script} não encontrado.`);
    process.exit(1);
  }
  const r = spawnSync(process.execPath, [script, ...rest], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}

function newScaffold(rest) {
  const type = rest[0];
  const slug = rest[1];
  if (!type || !slug || !["client-report", "workshop"].includes(type)) {
    err("Uso: decks-skill new <client-report|workshop> <slug>");
    process.exit(2);
  }
  const folderMap = {
    "client-report": "client-report-deck",
    workshop: "workshop-mentorship-deck",
  };
  const src = path.join(PACKAGE_ROOT, "skill", "templates", folderMap[type]);
  if (!fs.existsSync(src)) {
    err(`Erro: template ${src} não encontrado. Reinstale o package.`);
    process.exit(1);
  }
  const dest = path.resolve(slug);
  if (fs.existsSync(dest)) {
    err(`Erro: pasta já existe: ${dest}`);
    process.exit(1);
  }
  copyRecursive(src, dest);
  log(`Scaffold criado em ${dest}`);
  if (type === "workshop") {
    log("Próximos passos:");
    log("  1) Edite README.md");
    log("  2) Para cada dia: agenda/day-N.md, slides/day-N.md, html-slides/day-N.html");
    log("  3) Crie labs/day-N/lab.md");
    log("  4) Crie materials/speaker-notes/day-N/NN-*.md");
    log("  5) Rode `decks-skill lint html-slides/day-N.html`");
  } else {
    log("Próximos passos:");
    log("  1) Renomeie/edite deck.html");
    log("  2) Preencha source-notes.md e qa-notes.md");
    log("  3) Rode `decks-skill lint deck.html`");
    log("  4) `decks-skill preview deck.html` e revise contact-sheet.png");
    log("  5) `decks-skill render deck.html`");
  }
}

function main() {
  switch (cmd) {
    case undefined:
    case "--help":
    case "-h":
    case "help":
      printHelp();
      break;

    case "--version":
    case "-v":
    case "version":
      log(PACKAGE_JSON.version);
      break;

    case "install": {
      const force = args.includes("--force");
      install({ force });
      break;
    }

    case "update":
      install({ force: true });
      break;

    case "lint":
      lint(args.slice(1));
      break;

    case "render":
      render(args.slice(1));
      break;

    case "preview":
      preview(args.slice(1));
      break;

    case "new":
      newScaffold(args.slice(1));
      break;

    default:
      err(`Comando desconhecido: ${cmd}\n`);
      printHelp();
      process.exit(2);
  }
}

main();
