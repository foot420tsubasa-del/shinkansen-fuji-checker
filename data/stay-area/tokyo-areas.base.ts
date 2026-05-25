import type { StayAreaBase } from "@/lib/stay-area/types";
import data from "./tokyo-areas.base.json";

/*
 * Editorial source of truth for Tokyo stay areas.
 *
 * The data lives in `./tokyo-areas.base.json` so the same content feeds
 * both the TypeScript page (this re-export) and the plain Node .mjs
 * scripts under `scripts/`. Edit the JSON to add/edit areas; this shim
 * just type-casts the array.
 */
export const tokyoStayAreasBase: StayAreaBase[] = data as StayAreaBase[];
