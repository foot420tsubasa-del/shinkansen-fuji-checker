import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "affiliate-links.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

function isAuthorized(request: Request) {
  if (!ADMIN_TOKEN) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-admin-token") === ADMIN_TOKEN;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function readLinks(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeLinks(data: Record<string, unknown>) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n");
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
    if (!id || !config?.label) {
      return NextResponse.json({ error: "id and config.label are required" }, { status: 400 });
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
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const data = readLinks();
    delete data[id];
    writeLinks(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
