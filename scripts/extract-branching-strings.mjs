#!/usr/bin/env node
/**
 * Collects every user-facing ENGLISH string across the branching missions,
 * the FAQ, and the station-practice landing page into one de-duplicated list
 * (/tmp/sp-strings.json). These get translated into the 8 non-English locales;
 * Japanese sign fields (labelJa / textJa) are NOT collected — they stay verbatim.
 */
import fs from "node:fs";

const files = [
  "data/station-practice/branching/mission1Scenes.ts",
  "data/station-practice/branching/mission2Scenes.ts",
];

const set = new Set();
const add = (s) => {
  const v = s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
  if (v) set.add(v);
};

// Single-string fields (value may sit on the next line after the colon).
const SINGLE = [
  "labelEn", "textEn", "feedback", "missionText", "currentLocation",
  "imageAlt", "hint", "clearSummary", "title", "subtitle", "missionCopy",
];

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  for (const field of SINGLE) {
    const re = new RegExp(`\\b${field}\\s*:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g");
    let m;
    while ((m = re.exec(src))) add(m[1]);
  }
  // clearLessons: array of strings
  const arr = src.match(/clearLessons\s*:\s*\[([\s\S]*?)\]/g) || [];
  for (const block of arr) {
    const items = block.match(/"((?:[^"\\]|\\.)*)"/g) || [];
    for (const it of items) add(it.slice(1, -1));
  }
}

// FAQ
const faq = fs.readFileSync("data/station-practice/faq.ts", "utf8");
for (const field of ["question", "answer"]) {
  const re = new RegExp(`\\b${field}\\s*:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g");
  let m;
  while ((m = re.exec(faq))) add(m[1]);
}

// Landing page (hardcoded JSX strings — listed explicitly).
const landing = [
  // nav + hero
  "Missions", "How it works", "FAQ",
  "Pre-travel simulation",
  "Practice Japanese stations", "before your trip.",
  "A free navigation practice tool inspired by complex Tokyo-style stations. Learn how to read exits, transfers, gates, and platform signs before arriving in Japan.",
  "See the missions",
  // why
  "Why this helps",
  "Read station signs", "Read Japanese-first station signs with English support.",
  "Tell routes apart", "Tell exits, transfer gates, and platforms apart.",
  "Recover calmly", "Learn what to do when you follow the wrong route.",
  "Practice first", "Practice before your real trip.",
  // missions section
  "Station Practice missions",
  "Play any mission below. The two Sakura Central free-walk missions are available in all 9 languages.",
  // mission cards
  "High-Speed Rail → West Central Gate",
  "Practice finding the correct station side, ticket gate, and exit number.",
  "Practice following subway transfer signs, line colors, and transfer gates.",
  "Sakura Central — walk to the West Exit",
  "New free-walk mode: explore a full 7-floor station, follow the Japanese signs, and find your own way from the subway platform up to the 西口 street exit. Available in 9 languages.",
  "Sakura Central — subway → JR transfer",
  "Free-walk the same station on a harder route: follow JR のりかえ口 from the Red Metro platform up to the JR platforms on 3F. Available in 9 languages.",
  "Start Mission 1", "Start Mission 2", "Walk to the West Exit", "Walk the JR transfer",
  "Playable", "New", "Branching route", "Free walk · B3 → 1F", "Free walk · B3 → 3F",
  "Mission",
  // support
  "Free tool, supported by travel planning links",
  "This tool is free to use. Some links on fujiseat may be affiliate links, which means we may earn a small commission if you book through them, at no extra cost to you. Your support helps us keep building free Japan travel tools.",
  "Compare hotels near convenient stations",
  "Choose practical hotel areas near stations that fit your route.",
  "Prepare airport transfer",
  "Compare airport-to-hotel routes before your first arrival day.",
  "Get eSIM / Wi-Fi before arrival",
  "Prepare maps, translation, and station searches before landing.",
  "Open guide",
  // how it works
  "Choose a mission",
  "Pick a realistic scenario such as finding an exit or transferring to a subway line.",
  "Read the signs",
  "Use Japanese-first signs, English helper labels, route colors, and gate names to choose your next move.",
  "Recover from detours",
  "Wrong routes teach why the path is wrong, then return you to the decision point so you can continue.",
  "Step",
  // faq section
  "Quick answers about what this is and how it works.",
  // final CTA
  "Practice the routes.",
  "Mission 1 covers station exits, Mission 2 subway transfers, and the Sakura Central missions let you free-walk the whole station in 9 languages.",
  // footer
  "This is a practice simulator, not an official station map. Inspired by complex Tokyo-style stations. Layouts and signage are original.",
  "Station navigation practice · free travel-prep simulator",
];
landing.forEach(add);

const list = [...set].sort();
fs.writeFileSync("/tmp/sp-strings.json", JSON.stringify(list, null, 2));
console.log(`extracted ${list.length} unique English strings → /tmp/sp-strings.json`);
