#!/usr/bin/env node
/**
 * @elven-observability/decks-skill — preview-deck
 *
 * Renders one PNG per slide (1280x720 @2x) plus a contact-sheet.png
 * using Puppeteer.
 *
 * Usage:
 *   preview-deck.js <deck.html> [--out-dir <dir>]
 *
 * Defaults out-dir to <dirname-of-deck>/preview, with contact-sheet.png
 * placed as a sibling of preview/.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    process.stdout.write(
      "Usage: preview-deck.js <deck.html> [--out-dir <dir>]\n"
    );
    process.exit(0);
  }
  const input = path.resolve(args[0]);
  let outDir = path.join(path.dirname(input), "preview");
  const idx = args.indexOf("--out-dir");
  if (idx !== -1 && args[idx + 1]) {
    outDir = path.resolve(args[idx + 1]);
  }
  return { input, outDir };
}

async function main() {
  const { input, outDir } = parseArgs(process.argv);

  if (!fs.existsSync(input)) {
    process.stderr.write(`Error: ${input} not found\n`);
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch (err) {
    process.stderr.write(
      "Error: puppeteer not installed. Run `npm install` in the package root.\n"
    );
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    // 1.5x: nítido para QA, e mantém o PNG abaixo de 2000px por lado
    // (1920x1080) — seguro para abrir em qualquer visualizador/ferramenta.
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1.5 });
    await page.goto(`file://${input}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Charts are data-driven (elven-deck-charts.js). Force a re-render.
    await page.evaluate(() => {
      if (typeof window.renderCharts === "function") window.renderCharts();
    });
    await new Promise((r) => setTimeout(r, 350));

    const slideCount = await page.evaluate(
      () => document.querySelectorAll(".slide").length
    );
    if (slideCount === 0) {
      process.stderr.write("Error: no .slide elements found.\n");
      process.exit(1);
    }

    const slideFiles = [];
    for (let i = 0; i < slideCount; i++) {
      const handle = await page.evaluateHandle(
        (idx) => document.querySelectorAll(".slide")[idx],
        i
      );
      const elem = handle.asElement();
      if (!elem) continue;
      const n = String(i + 1).padStart(2, "0");
      const outFile = path.join(outDir, `slide-${n}.png`);
      // Element-scoped screenshot: positions correctly regardless of scroll.
      await elem.screenshot({ path: outFile, omitBackground: false });
      slideFiles.push(outFile);
      process.stdout.write(`  -> ${outFile}\n`);
    }

    // Contact sheet: build a temporary HTML grid 4-col and screenshot fullPage.
    const sheetHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  body { margin: 0; padding: 16px; background: #0b1220; font-family: Inter, sans-serif; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .cell { background: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
  .cell img { display: block; width: 100%; height: auto; }
  .cell .n { padding: 6px 10px; font-size: 11px; color: #64748b; background: #f4f7f8; letter-spacing: 0.08em; text-transform: uppercase; }
</style></head>
<body>
  <div class="grid">
${slideFiles
  .map((f, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `    <div class="cell"><img src="file://${f}"><div class="n">slide ${n}</div></div>`;
  })
  .join("\n")}
  </div>
</body></html>`;

    const tmpSheet = path.join(outDir, "_contact-sheet.html");
    fs.writeFileSync(tmpSheet, sheetHtml);

    await page.goto(`file://${tmpSheet}`, { waitUntil: "networkidle0" });
    const fullHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewport({
      width: 1280,
      height: Math.max(fullHeight, 720),
      deviceScaleFactor: 1,
    });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));

    const sheetOut = path.join(path.dirname(outDir), "contact-sheet.png");
    await page.screenshot({ path: sheetOut, fullPage: true });
    fs.unlinkSync(tmpSheet);

    process.stdout.write(`Contact sheet: ${sheetOut}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  process.stderr.write(
    `Preview failed: ${err && err.message ? err.message : err}\n`
  );
  process.exit(1);
});
