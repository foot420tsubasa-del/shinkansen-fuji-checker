import fs from "node:fs";
import path from "node:path";
import { tokyoStayAreasBase } from "../data/stay-area/tokyo-areas.base";
import signals from "../data/generated/tokyo-stay-area-signals.json";
import { buildTokyoStayAreaScores } from "../lib/stay-area/scoring";
import type { StayAreaSignalsFile } from "../lib/stay-area/types";

const generatedAt = new Date().toISOString();
const scores = buildTokyoStayAreaScores(tokyoStayAreasBase, signals as StayAreaSignalsFile);
const outputPath = path.join(process.cwd(), "data/generated/tokyo-stay-area-scores.json");

fs.writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt,
      mode: signals.mode,
      areas: scores,
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote ${scores.length} Tokyo stay-area scores to ${outputPath}`);
