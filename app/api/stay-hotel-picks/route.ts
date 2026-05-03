import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "stay-hotel-picks.json");
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

function readPicks(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writePicks(data: Record<string, unknown>) {
  const json = JSON.stringify(data, null, 2) + "\n";
  const tmp = DATA_PATH + ".tmp";
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, DATA_PATH);
}

function isValidPick(pick: unknown): pick is Record<string, unknown> {
  if (!pick || typeof pick !== "object" || Array.isArray(pick)) return false;
  const p = pick as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.area === "string" &&
    typeof p.price === "string" &&
    typeof p.hotelKey === "string" &&
    typeof p.tripUrl === "string" &&
    typeof p.label === "string" &&
    (!("tag" in p) || typeof p.tag === "string")
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    return NextResponse.json(readPicks());
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    const { slug, id, config } = await request.json();
    if (typeof slug !== "string" || !slug.trim() || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "slug and id are required" }, { status: 400 });
    }
    if (!isValidPick(config)) {
      return NextResponse.json({ error: "Invalid stay hotel pick config" }, { status: 400 });
    }
    const data = readPicks();
    const picks = data[slug];
    if (!Array.isArray(picks)) {
      return NextResponse.json({ error: "Stay page not found" }, { status: 404 });
    }
    const index = picks.findIndex((pick) => {
      return Boolean(pick && typeof pick === "object" && "id" in pick && (pick as { id?: unknown }).id === id);
    });
    if (index === -1) {
      return NextResponse.json({ error: "Hotel pick not found" }, { status: 404 });
    }
    picks[index] = config;
    data[slug] = picks;
    writePicks(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
