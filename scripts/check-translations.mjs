import fs from "node:fs";
import path from "node:path";

const messagesDir = path.join(process.cwd(), "messages");
const sourceFile = path.join(messagesDir, "en.json");
const source = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

const localeFiles = fs
  .readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json") && file !== "en.json")
  .sort();

const allowedIdenticalValues = new Set([
  "fujiseat.com",
  "JR Pass",
  "Narita Express (N'EX)",
  "Narita (NRT)",
  "COFFEE STAND OZ",
  "ROAM COFFEE",
  "Kiyosumi Garden",
  "Fukagawa Edo Museum",
  "Edo-Tokyo Museum",
  "Tokyo",
  "Kyoto",
  "Osaka",
  "Shinjuku",
  "Shibuya",
  "Ueno",
  "Asakusa",
  "Tokyo Station",
  "Kiyosumi-Shirakawa",
  "Kiyosumi-Shirakawa / East Tokyo",
  "Kuramae",
  "Oshiage",
  "Suitengumae / Ningyocho",
  "Monzen-Nakacho",
  "Ryogoku",
  "Hiroshima",
  "Kawaguchiko",
  "Hakone",
  "2h15m",
]);

const allowedPathPatterns = [
  /^planner\.routes\..*\.desc$/,
  /^guide\.seasons\.\d+\.stars$/,
  /^guide\.carRequest\.\d+\.bold$/,
  /^.*\.href$/,
];

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function formatPath(parts) {
  return parts.join(".");
}

function compare(sourceNode, targetNode, parts, issues) {
  if (Array.isArray(sourceNode)) {
    if (!Array.isArray(targetNode)) {
      issues.missing.push(formatPath(parts));
      return;
    }

    sourceNode.forEach((item, index) => compare(item, targetNode[index], [...parts, String(index)], issues));
    return;
  }

  if (isPlainObject(sourceNode)) {
    if (!isPlainObject(targetNode)) {
      issues.missing.push(formatPath(parts));
      return;
    }

    for (const key of Object.keys(sourceNode)) {
      compare(sourceNode[key], targetNode[key], [...parts, key], issues);
    }
    return;
  }

  const keyPath = formatPath(parts);
  if (targetNode === undefined) {
    issues.missing.push(keyPath);
    return;
  }

  if (
    targetNode === sourceNode &&
    !allowedIdenticalValues.has(String(sourceNode)) &&
    !allowedPathPatterns.some((pattern) => pattern.test(keyPath))
  ) {
    issues.identical.push(`${keyPath} = ${JSON.stringify(sourceNode)}`);
  }
}

let failed = false;

for (const file of localeFiles) {
  const target = JSON.parse(fs.readFileSync(path.join(messagesDir, file), "utf8"));
  const issues = { missing: [], identical: [] };
  compare(source, target, [], issues);

  if (issues.missing.length || issues.identical.length) {
    failed = true;
    console.error(`\n${file}`);
    for (const keyPath of issues.missing) {
      console.error(`  missing: ${keyPath}`);
    }
    for (const identical of issues.identical) {
      console.error(`  untranslated: ${identical}`);
    }
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`Translation check passed for ${localeFiles.length} locale files.`);
}
