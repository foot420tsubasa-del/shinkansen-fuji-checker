#!/usr/bin/env node
/** Optimize the 5 extra viewpoints the free-walk graph adds (1280w q72 webp). */
import sharp from "sharp";
import path from "node:path";

const SRC = "station_practice";
const OUT = "public/images/station-practice/sakura";

const SCENES = [
  { src: "B3階/ChatGPT Image 2026年5月11日 09_43_56 (6).png", out: "b3-concourse.webp" },
  { src: "B3階/ChatGPT Image 2026年5月11日 09_43_56 (2).png", out: "b3-platform-end.webp" },
  { src: "B2階/ChatGPT Image 2026年5月11日 09_45_23 (10).png", out: "b2-hall.webp" },
  { src: "B1階/ChatGPT Image 2026年5月11日 09_47_00 (3).png", out: "b1-shops.webp" },
  { src: "1階/ChatGPT Image 2026年5月11日 09_48_07 (2).png", out: "1f-plaza-outdoor.webp" },
];

for (const { src, out } of SCENES) {
  const info = await sharp(path.join(SRC, src))
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(OUT, out));
  console.log(`  ${out.padEnd(24)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
