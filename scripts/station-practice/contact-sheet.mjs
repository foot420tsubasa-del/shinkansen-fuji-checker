#!/usr/bin/env node
/**
 * Build a labelled contact sheet (montage) for a floor folder so the whole
 * viewpoint set can be surveyed in one image. Each tile is numbered to match
 * its source file's "(N)" suffix.
 *
 * Usage: node scripts/contact-sheet.mjs "<folder>" "<out.png>"
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const folder = process.argv[2];
const out = process.argv[3];

const files = fs
  .readdirSync(folder)
  .filter((f) => /\.png$/i.test(f))
  .sort()
  .map((f, i) => ({ f, n: i + 1 }));

const COLS = 5;
const TILE_W = 320;
const TILE_H = 180;
const PAD = 6;
const LABEL = 22;
const cellW = TILE_W + PAD * 2;
const cellH = TILE_H + PAD * 2 + LABEL;
const rows = Math.ceil(files.length / COLS);
const W = COLS * cellW;
const H = rows * cellH;

const composites = [];
for (let i = 0; i < files.length; i++) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = col * cellW + PAD;
  const y = row * cellH + PAD + LABEL;
  const buf = await sharp(path.join(folder, files[i].f))
    .resize(TILE_W, TILE_H, { fit: "cover" })
    .toBuffer();
  composites.push({ input: buf, left: x, top: y });
  const label = Buffer.from(
    `<svg width="${cellW}" height="${LABEL}"><text x="6" y="16" font-family="sans-serif" font-size="15" fill="white">#${files[i].n}</text></svg>`,
  );
  composites.push({ input: label, left: col * cellW, top: row * cellH + 2 });
}

await sharp({
  create: { width: W, height: H, channels: 3, background: "#111" },
})
  .composite(composites)
  .png()
  .toFile(out);

console.log(`${out}: ${files.length} tiles (${COLS}x${rows})`);
