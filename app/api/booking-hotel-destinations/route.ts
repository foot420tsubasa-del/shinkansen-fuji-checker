import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "booking-hotel-destinations.json");
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

function readDestinations(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeDestinations(data: Record<string, unknown>) {
  const json = JSON.stringify(data, null, 2) + "\n";
  const tmp = DATA_PATH + ".tmp";
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, DATA_PATH);
}

function isValidConfig(config: unknown): config is Record<string, unknown> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  return (
    typeof c.area_id === "string" &&
    typeof c.label === "string" &&
    typeof c.booking_query_label === "string" &&
    (c.booking_scope === "station" ||
      c.booking_scope === "neighborhood" ||
      c.booking_scope === "area_cluster" ||
      c.booking_scope === "city_fallback") &&
    typeof c.destination_url === "string" &&
    typeof c.affiliate_url === "string" &&
    (c.inventory_confidence === "high" || c.inventory_confidence === "medium" || c.inventory_confidence === "low") &&
    (c.url_status === "active" ||
      c.url_status === "needs_review" ||
      c.url_status === "too_broad" ||
      c.url_status === "too_narrow") &&
    typeof c.last_checked_at === "string" &&
    typeof c.notes === "string"
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  try {
    return NextResponse.json(readDestinations());
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
      return NextResponse.json({ error: "Invalid booking hotel destination config" }, { status: 400 });
    }
    const data = readDestinations();
    data[id] = config;
    writeDestinations(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
