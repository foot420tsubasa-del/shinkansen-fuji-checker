#!/usr/bin/env node
/** Optimize the 31 extra per-floor viewpoints that densify each floor (1280w q72 webp). */
import sharp from "sharp";
import path from "node:path";

const SRC = "station_practice";
const OUT = "public/images/station-practice/sakura";
const J = (d, n) => `${d}/ChatGPT Image 2026年5月11日 ${n}.png`;

const SCENES = [
  // B3
  { src: J("B3階", "09_43_55 (1)"), out: "b3-platform-mid.webp" },
  { src: J("B3階", "09_43_56 (4)"), out: "b3-platform-far.webp" },
  { src: J("B3階", "09_44_33 (1)"), out: "b3-gate-hall.webp" },
  { src: J("B3階", "09_44_34 (6)"), out: "b3-down-corridor.webp" },
  { src: J("B3階", "09_44_35 (10)"), out: "b3-gates.webp" },
  // B2
  { src: J("B2階", "09_45_23 (2)"), out: "b2-concourse.webp" },
  { src: J("B2階", "09_45_23 (5)"), out: "b2-rotunda.webp" },
  { src: J("B2階", "09_45_23 (9)"), out: "b2-line-gates.webp" },
  { src: J("B2階", "09_45_52 (7)"), out: "b2-shops.webp" },
  { src: J("B2階", "09_46_09 (5)"), out: "b2-line-corridor.webp" },
  // B1
  { src: J("B1階", "09_46_26 (1)"), out: "b1-concourse.webp" },
  { src: J("B1階", "09_46_27 (3)"), out: "b1-foodhall.webp" },
  { src: J("B1階", "09_46_27 (7)"), out: "b1-junction.webp" },
  { src: J("B1階", "09_47_00 (8)"), out: "b1-crossing.webp" },
  { src: J("B1階", "09_47_01 (10)"), out: "b1-up-escalator.webp" },
  // 1F
  { src: J("1階", "09_47_38 (3)"), out: "1f-glass-exit.webp" },
  { src: J("1階", "09_47_59 (3)"), out: "1f-east-street.webp" },
  { src: J("1階", "09_48_00 (9)"), out: "1f-outdoor-street.webp" },
  { src: J("1階", "09_48_07 (4)"), out: "1f-concourse-2.webp" },
  // 2F
  { src: J("2階", "09_48_32 (2)"), out: "f2-concourse-2.webp" },
  { src: J("2階", "09_48_32 (6)"), out: "f2-fare-gates.webp" },
  { src: J("2階", "09_48_40 (3)"), out: "f2-east-hall.webp" },
  { src: J("2階", "09_49_04 (4)"), out: "f2-corridor.webp" },
  // 3F
  { src: J("3階", "09_49_20 (6)"), out: "f3-platform-green.webp" },
  { src: J("3階", "09_49_25 (1)"), out: "f3-platform-twin.webp" },
  { src: J("3階", "09_49_26 (6)"), out: "f3-platform-overview.webp" },
  { src: J("3階", "09_49_58 (3)"), out: "f3-departure-boards.webp" },
  // 4F
  { src: J("4階", "09_50_19 (1)"), out: "f4-sky-garden.webp" },
  { src: J("4階", "09_50_20 (6)"), out: "f4-lounge.webp" },
  { src: J("4階", "09_50_33 (2)"), out: "f4-deck-view.webp" },
  { src: J("4階", "09_50_33 (7)"), out: "f4-night-deck.webp" },
];

let total = 0;
for (const { src, out } of SCENES) {
  const info = await sharp(path.join(SRC, src))
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(OUT, out));
  total += info.size;
  console.log(`  ${out.padEnd(24)} ${(info.size / 1024).toFixed(0)} KB`);
}
console.log(`\n${SCENES.length} files, +${(total / 1024 / 1024).toFixed(2)} MB`);
