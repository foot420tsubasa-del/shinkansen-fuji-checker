import fs from "node:fs";
import path from "node:path";

/*
 * Server-side resolver for optional per-area visual assets.
 *
 * Convention:
 *   /public/images/hotel-areas/<slug>/<slot>.{png,jpg,jpeg,webp}
 *
 * If a file is present, `getAreaVisualAsset(slug, slot)` returns the
 * public-relative path (e.g. "/images/hotel-areas/oshiage/how-this-area-connects.png").
 * If no file is present, it returns `null` and the page should render its
 * lightweight in-code fallback UI for that slot.
 *
 * Used only on the server (uses `fs.existsSync`). Safe at static build time.
 */

export type AreaVisualSlot =
  | "how-this-area-connects"
  | "area-vibe"
  | "nearby-alternatives";

export const AREA_VISUAL_SLOTS: readonly AreaVisualSlot[] = [
  "how-this-area-connects",
  "area-vibe",
  "nearby-alternatives",
] as const;

/** Asset file extensions checked, in priority order. PNG first because the
 *  hand-off spec defaults to .png; jpg/webp are accepted as upgrades. */
const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

function publicPathFor(slug: string, slot: AreaVisualSlot, ext: string): string {
  return `/images/hotel-areas/${slug}/${slot}${ext}`;
}

/**
 * Returns the public-relative path to the asset if it exists, else null.
 * Scans the supported extension list in priority order.
 */
export function getAreaVisualAsset(slug: string, slot: AreaVisualSlot): string | null {
  for (const ext of SUPPORTED_EXTENSIONS) {
    const rel = publicPathFor(slug, slot, ext);
    const abs = path.join(process.cwd(), "public", rel.replace(/^\//, ""));
    if (fs.existsSync(abs)) return rel;
  }
  return null;
}

/** Resolve every visual slot for an area in one call. Unset slots stay null. */
export function getAreaVisualAssets(slug: string): Record<AreaVisualSlot, string | null> {
  return AREA_VISUAL_SLOTS.reduce(
    (acc, slot) => {
      acc[slot] = getAreaVisualAsset(slug, slot);
      return acc;
    },
    {} as Record<AreaVisualSlot, string | null>,
  );
}
