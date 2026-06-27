#!/usr/bin/env node
/**
 * @elven-observability/decks-skill — render-deck
 *
 * Renders an Elven deck HTML file to PDF using Puppeteer.
 * Output: 1280x720, 1 page per slide, print backgrounds, zero margin.
 *
 * Usage:
 *   render-deck.js <deck.html> [--out <out.pdf>]
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    process.stdout.write(
      "Usage: render-deck.js <deck.html> [--out <out.pdf>]\n"
    );
    process.exit(0);
  }
  const input = args[0];
  let out = input.replace(/\.html?$/i, ".pdf");
  const outIdx = args.indexOf("--out");
  if (outIdx !== -1 && args[outIdx + 1]) {
    out = args[outIdx + 1];
  }
  return { input: path.resolve(input), out: path.resolve(out) };
}

async function main() {
  const { input, out } = parseArgs(process.argv);

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

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
    await page.goto(`file://${input}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Charts are data-driven (elven-deck-charts.js). Force a re-render once
    // layout is settled, then give the SVG a beat to paint.
    await page.evaluate(() => {
      if (typeof window.renderCharts === "function") window.renderCharts();
    });
    await new Promise((r) => setTimeout(r, 350));

    await page.emulateMediaType("print");

    await page.pdf({
      path: out,
      width: "1280px",
      height: "720px",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const size = fs.statSync(out).size;
    process.stdout.write(`PDF written: ${out} (${size} bytes)\n`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  process.stderr.write(`Render failed: ${err && err.message ? err.message : err}\n`);
  process.exit(1);
});
