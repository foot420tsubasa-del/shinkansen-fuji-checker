#!/usr/bin/env node
/**
 * Optimize EVERY remaining floor-folder viewpoint (the ones not already used by
 * a curated node) into webp under sakura/, named `<code>-xNN.webp`, and emit a
 * manifest the graph generator reads to wire them all as "explore" nodes.
 *
 * Curated source files (already shipped under nice names) are skipped so we
 * don't ship the same image twice.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "station_practice";
const OUT = "public/images/station-practice/sakura";

const FLOORS = [
  { dir: "B3階", code: "b3" },
  { dir: "B2階", code: "b2" },
  { dir: "B1階", code: "b1" },
  { dir: "1階", code: "f1" },
  { dir: "2階", code: "f2" },
  { dir: "3階", code: "f3" },
  { dir: "4階", code: "f4" },
];

// Source basenames already used by curated nodes (skip — avoid duplicates).
const CURATED = new Set([
  // B3
  "09_43_55 (1)", "09_43_56 (2)", "09_43_56 (4)", "09_43_56 (6)",
  "09_44_33 (1)", "09_44_34 (6)", "09_44_35 (10)",
  // B2
  "09_45_23 (2)", "09_45_23 (5)", "09_45_23 (9)", "09_45_23 (10)",
  "09_45_52 (7)", "09_46_09 (5)",
  // B1
  "09_46_26 (1)", "09_46_27 (3)", "09_46_27 (7)", "09_47_00 (3)",
  "09_47_00 (8)", "09_47_01 (10)",
  // 1F
  "09_47_38 (1)", "09_47_38 (3)", "09_47_59 (1)", "09_47_59 (3)",
  "09_48_00 (9)", "09_48_07 (2)", "09_48_07 (4)",
  // 2F
  "09_48_32 (2)", "09_48_32 (5)", "09_48_32 (6)", "09_48_39 (2)",
  "09_48_40 (3)", "09_49_03 (1)", "09_49_04 (4)",
  // 3F
  "09_49_19 (2)", "09_49_20 (6)", "09_49_25 (1)", "09_49_26 (6)",
  "09_49_27 (10)", "09_49_58 (3)", "09_49_58 (4)",
  // 4F
  "09_50_19 (1)", "09_50_20 (3)", "09_50_20 (6)", "09_50_20 (10)",
  "09_50_33 (2)", "09_50_33 (7)", "09_50_33 (10)",
]);

const baseOf = (f) => f.replace(/^ChatGPT Image 2026年5月11日 /, "").replace(/\.png$/i, "");

const manifest = {};
let total = 0, count = 0;
for (const { dir, code } of FLOORS) {
  const files = fs.readdirSync(path.join(SRC, dir)).filter((f) => /\.png$/i.test(f)).sort();
  const list = [];
  let nn = 0;
  for (const f of files) {
    if (CURATED.has(baseOf(f))) continue;
    nn += 1;
    const out = `${code}-x${String(nn).padStart(2, "0")}.webp`;
    const info = await sharp(path.join(SRC, dir, f))
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toFile(path.join(OUT, out));
    total += info.size;
    count += 1;
    list.push(out.replace(/\.webp$/, ""));
  }
  manifest[code] = list;
  console.log(`${code}: ${list.length} explore views`);
}

fs.writeFileSync(path.join("scripts", "sp-explore-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${count} files, +${(total / 1024 / 1024).toFixed(2)} MB → manifest written`);
