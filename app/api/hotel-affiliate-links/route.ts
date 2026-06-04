import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "hotel-affiliate-links.json");
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

function isValidConfig(config: unknown): config is Record<string, unknown> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  const validPlacements = new Set([
    "top3",
    "detail",
    "tokyo_first_time_card",
    "before_shinkansen_card",
    "airport_page_first_night_cta",
    "comparison_area_cta",
  ]);
  return (
    c.provider === "booking_travelpayouts" &&
    typeof c.area_id === "string" &&
    (typeof c.locale === "string" && c.locale.length > 0) &&
    typeof c.placement === "string" &&
    validPlacements.has(c.placement) &&
    (typeof c.page_group === "undefined" || typeof c.page_group === "string") &&
    (typeof c.destination_ref === "undefined" || typeof c.destination_ref === "string") &&
    typeof c.destination_url === "string" &&
    typeof c.affiliate_url === "string" &&
    typeof c.sub_id === "string" &&
    typeof c.enabled === "boolean" &&
    typeof c.priority === "number" &&
    Number.isFinite(c.priority) &&
    typeof c.last_checked_at === "string" &&
    typeof c.notes === "string"
  );
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
      return NextResponse.json({ error: "Invalid hotel affiliate link config" }, { status: 400 });
    }
    const data = readLinks();
    data[id] = config;
    writeLinks(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
