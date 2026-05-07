import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "agoda-hotel-maps.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

function isAuthorized(request: Request) {
  if (!ADMIN_TOKEN) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  return request.headers.get("x-admin-token") === ADMIN_TOKEN;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function readMaps(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeMaps(data: Record<string, unknown>) {
  const json = JSON.stringify(data, null, 2) + "\n";
  const tmp = DATA_PATH + ".tmp";
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, DATA_PATH);
}

function isValidConfig(config: unknown): config is Record<string, unknown> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.label === "string" &&
    typeof c.areaName === "string" &&
    typeof c.city === "string" &&
    typeof c.country === "string" &&
    (c.status === "draft" || c.status === "active" || c.status === "disabled") &&
    typeof c.placementDefault === "string" &&
    typeof c.embedCode === "string" &&
    typeof c.scriptUrl === "string" &&
    typeof c.iframeUrl === "string" &&
    typeof c.notes === "string" &&
    typeof c.lastChecked === "string"
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    return NextResponse.json(readMaps());
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    const { id, config } = await request.json();
    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (!isValidConfig(config) || config.id !== id) {
      return NextResponse.json({ error: "Invalid Agoda hotel map config" }, { status: 400 });
    }
    const data = readMaps();
    if (!(id in data)) {
      return NextResponse.json({ error: "Agoda hotel map not found" }, { status: 404 });
    }
    data[id] = config;
    writeMaps(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
