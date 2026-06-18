#!/usr/bin/env node
/** Optimize 2F/3F/4F viewpoints (1280w q72) + their blueprints (1100w q80). */
import sharp from "sharp";
import path from "node:path";

const SRC = "station_practice";
const OUT = "public/images/station-practice/sakura";
const BP = "設計図と各階の基準画像";

const SCENES = [
  { src: "2階/ChatGPT Image 2026年5月11日 09_48_39 (2).png", out: "f2-concourse.webp" },
  { src: "2階/ChatGPT Image 2026年5月11日 09_48_32 (5).png", out: "f2-jrgates.webp" },
  { src: "2階/ChatGPT Image 2026年5月11日 09_49_03 (1).png", out: "f2-westhall.webp" },
  { src: "3階/ChatGPT Image 2026年5月11日 09_49_19 (2).png", out: "f3-jr-concourse.webp" },
  { src: "3階/ChatGPT Image 2026年5月11日 09_49_58 (4).png", out: "f3-jr-platform.webp" },
  { src: "3階/ChatGPT Image 2026年5月11日 09_49_27 (10).png", out: "f3-northdeck.webp" },
  { src: "4階/ChatGPT Image 2026年5月11日 09_50_20 (3).png", out: "f4-sky.webp" },
  { src: "4階/ChatGPT Image 2026年5月11日 09_50_20 (10).png", out: "f4-observation.webp" },
  { src: "4階/ChatGPT Image 2026年5月11日 09_50_33 (10).png", out: "f4-restaurants.webp" },
];

const BLUEPRINTS = [
  { src: `${BP}/ChatGPT Image 2026年5月11日 09_42_23 (5).png`, out: "blueprint-2f.webp" },
  { src: `${BP}/ChatGPT Image 2026年5月11日 09_42_23 (6).png`, out: "blueprint-3f.webp" },
  { src: `${BP}/ChatGPT Image 2026年5月11日 09_42_23 (7).png`, out: "blueprint-4f.webp" },
];

async function run(list, width, quality) {
  for (const { src, out } of list) {
    const info = await sharp(path.join(SRC, src))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(path.join(OUT, out));
    console.log(`  ${out.padEnd(22)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
}

console.log("Scenes:");
await run(SCENES, 1280, 72);
console.log("Blueprints:");
await run(BLUEPRINTS, 1100, 80);
