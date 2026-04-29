import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "affiliate-links.json");
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

function readLinks(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeLinks(data: Record<string, unknown>) {
  const json = JSON.stringify(data, null, 2) + "\n";
  const tmp = DATA_PATH + ".tmp";
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, DATA_PATH);
}

const REQUIRED_FIELDS = ["label", "provider", "adid", "klookPath", "directUrl", "usedOn"] as const;

function isValidConfig(config: unknown): config is Record<string, unknown> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  if (typeof c.label !== "string" || !c.label.trim()) return false;
  if (typeof c.provider !== "string") return false;
  if (!Array.isArray(c.usedOn)) return false;
  for (const f of REQUIRED_FIELDS) {
    if (!(f in c)) return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    return NextResponse.json(readLinks());
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
    if (!isValidConfig(config)) {
      return NextResponse.json(
        { error: "Invalid config: label, provider, adid, klookPath, directUrl, usedOn are required" },
        { status: 400 },
      );
    }
    const data = readLinks();
    data[id] = config;
    writeLinks(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    const { id } = await request.json();
    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const data = readLinks();
    if (!(id in data)) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    delete data[id];
    writeLinks(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
