/**
 * Sakura Central Station — full free-walk node graph (all 7 floors).
 *
 * A Street-View / Myst-style navigable map of the whole station, B3 → 4F.
 * Each node is one POV viewpoint; each exit is a directional hotspot overlaid
 * on the scene that walks you to a connected viewpoint. Movement is free — take
 * detours, ride up to the observation deck, backtrack — and you navigate by
 * reading the Japanese wayfinding signs toward your goal.
 *
 * Two missions share this one graph:
 *   - west: B3 Red Metro platform → 1F 西口 (West Exit)   [underground spine]
 *   - jr:   B3 Red Metro platform → 3F JR平台 (JR platform) [subway → JR transfer]
 *
 * Copy lives in messages/*.json under `stationPractice.mission.*`; this file is
 * language-agnostic. Japanese sign tokens stay verbatim in the copy.
 */

export type ExitDir = "up" | "down" | "left" | "right";

export type SakuraExit = {
  to: string;
  /** i18n key under mission.exits.* */
  labelKey: string;
  /** Placement zone + arrow direction of the hotspot. */
  dir: ExitDir;
};

export type SakuraNode = {
  id: string;
  floor: string;
  /** Scene still (without extension) under .../sakura/. */
  image: string;
  /** Floor blueprint (without extension) used as the minimap. */
  blueprint: string;
  /** "You are here" marker position as % of the blueprint image. */
  marker: { x: number; y: number };
  /** i18n keys under mission.nodes.{names,caps}.* */
  nameKey: string;
  captionKey: string;
  exits: SakuraExit[];
};

/** Floors top → bottom (for the minimap rail). */
export const SAKURA_FLOORS = ["4F", "3F", "2F", "1F", "B1", "B2", "B3"] as const;

export const SAKURA_IMAGE_BASE = "/images/station-practice/sakura";

const nodes: Record<string, SakuraNode> = {
  // ---- B3 · Metro platforms ----
  "b3-platform": {
    id: "b3-platform", floor: "B3", image: "b3-red-platform", blueprint: "blueprint-b3",
    marker: { x: 50, y: 58 }, nameKey: "b3Platform", captionKey: "b3Platform",
    exits: [
      { to: "b3-concourse", labelKey: "toB3Concourse", dir: "up" },
      { to: "b3-end", labelKey: "b3PlatformEnd", dir: "right" },
    ],
  },
  "b3-end": {
    id: "b3-end", floor: "B3", image: "b3-platform-end", blueprint: "blueprint-b3",
    marker: { x: 72, y: 42 }, nameKey: "b3End", captionKey: "b3End",
    exits: [{ to: "b3-platform", labelKey: "backToPlatform", dir: "down" }],
  },
  "b3-concourse": {
    id: "b3-concourse", floor: "B3", image: "b3-concourse", blueprint: "blueprint-b3",
    marker: { x: 50, y: 40 }, nameKey: "b3Concourse", captionKey: "b3Concourse",
    exits: [
      { to: "b2-hall", labelKey: "escUpToB2", dir: "up" },
      { to: "b3-platform", labelKey: "backToPlatform", dir: "down" },
    ],
  },

  // ---- B2 · Subway transfer hall ----
  "b2-hall": {
    id: "b2-hall", floor: "B2", image: "b2-hall", blueprint: "blueprint-b2",
    marker: { x: 50, y: 50 }, nameKey: "b2Hall", captionKey: "b2Hall",
    exits: [
      { to: "b1-mall", labelKey: "toB1West", dir: "up" },
      { to: "b2-platdir", labelKey: "b2PlatformDirs", dir: "right" },
    ],
  },
  "b2-platdir": {
    id: "b2-platdir", floor: "B2", image: "b2-transfer-hall", blueprint: "blueprint-b2",
    marker: { x: 34, y: 56 }, nameKey: "b2Platdir", captionKey: "b2Platdir",
    exits: [{ to: "b2-hall", labelKey: "backToHall", dir: "down" }],
  },

  // ---- B1 · Underground mall ----
  "b1-mall": {
    id: "b1-mall", floor: "B1", image: "b1-underground-mall", blueprint: "blueprint-b1",
    marker: { x: 48, y: 60 }, nameKey: "b1Mall", captionKey: "b1Mall",
    exits: [
      { to: "f1-concourse", labelKey: "toCentralExit1F", dir: "up" },
      { to: "b1-shops", labelKey: "b1Shops", dir: "right" },
    ],
  },
  "b1-shops": {
    id: "b1-shops", floor: "B1", image: "b1-shops", blueprint: "blueprint-b1",
    marker: { x: 66, y: 46 }, nameKey: "b1Shops", captionKey: "b1Shops",
    exits: [{ to: "b1-mall", labelKey: "backToMall", dir: "down" }],
  },

  // ---- 1F · Ground-level exits ----
  "f1-concourse": {
    id: "f1-concourse", floor: "1F", image: "1f-central-plaza", blueprint: "blueprint-1f",
    marker: { x: 42, y: 55 }, nameKey: "f1Concourse", captionKey: "f1Concourse",
    exits: [
      { to: "f1-west", labelKey: "west", dir: "left" },
      { to: "f2-concourse", labelKey: "to2FConcourse", dir: "up" },
      { to: "f1-plaza", labelKey: "centralPlazaOutside", dir: "right" },
    ],
  },
  "f1-plaza": {
    id: "f1-plaza", floor: "1F", image: "1f-plaza-outdoor", blueprint: "blueprint-1f",
    marker: { x: 42, y: 82 }, nameKey: "f1Plaza", captionKey: "f1Plaza",
    exits: [{ to: "f1-concourse", labelKey: "backIndoors", dir: "down" }],
  },
  "f1-west": {
    id: "f1-west", floor: "1F", image: "1f-west-exit", blueprint: "blueprint-1f",
    marker: { x: 22, y: 54 }, nameKey: "f1West", captionKey: "f1West",
    exits: [{ to: "f1-concourse", labelKey: "backGeneric", dir: "down" }],
  },

  // ---- 2F · Main concourse ----
  "f2-concourse": {
    id: "f2-concourse", floor: "2F", image: "f2-concourse", blueprint: "blueprint-2f",
    marker: { x: 50, y: 52 }, nameKey: "f2Concourse", captionKey: "f2Concourse",
    exits: [
      { to: "f2-jrgates", labelKey: "toJrGates", dir: "up" },
      { to: "f2-westhall", labelKey: "f2WestHall", dir: "left" },
      { to: "f1-concourse", labelKey: "down1FExits", dir: "down" },
    ],
  },
  "f2-jrgates": {
    id: "f2-jrgates", floor: "2F", image: "f2-jrgates", blueprint: "blueprint-2f",
    marker: { x: 50, y: 38 }, nameKey: "f2Jrgates", captionKey: "f2Jrgates",
    exits: [
      { to: "f3-jr-concourse", labelKey: "escUpTo3FJr", dir: "up" },
      { to: "f2-concourse", labelKey: "backToConcourse2F", dir: "down" },
    ],
  },
  "f2-westhall": {
    id: "f2-westhall", floor: "2F", image: "f2-westhall", blueprint: "blueprint-2f",
    marker: { x: 24, y: 52 }, nameKey: "f2Westhall", captionKey: "f2Westhall",
    exits: [{ to: "f2-concourse", labelKey: "backToConcourse2F", dir: "down" }],
  },

  // ---- 3F · JR platforms & North Deck ----
  "f3-jr-concourse": {
    id: "f3-jr-concourse", floor: "3F", image: "f3-jr-concourse", blueprint: "blueprint-3f",
    marker: { x: 50, y: 60 }, nameKey: "f3JrConcourse", captionKey: "f3JrConcourse",
    exits: [
      { to: "f3-jr-platform", labelKey: "toJrPlatform", dir: "left" },
      { to: "f4-sky", labelKey: "escUpTo4F", dir: "up" },
      { to: "f3-northdeck", labelKey: "f3NorthDeck", dir: "right" },
      { to: "f2-jrgates", labelKey: "backToGates", dir: "down" },
    ],
  },
  "f3-jr-platform": {
    id: "f3-jr-platform", floor: "3F", image: "f3-jr-platform", blueprint: "blueprint-3f",
    marker: { x: 50, y: 40 }, nameKey: "f3JrPlatform", captionKey: "f3JrPlatform",
    exits: [{ to: "f3-jr-concourse", labelKey: "backToJrConcourse", dir: "down" }],
  },
  "f3-northdeck": {
    id: "f3-northdeck", floor: "3F", image: "f3-northdeck", blueprint: "blueprint-3f",
    marker: { x: 50, y: 20 }, nameKey: "f3Northdeck", captionKey: "f3Northdeck",
    exits: [{ to: "f3-jr-concourse", labelKey: "backToJrConcourse", dir: "down" }],
  },

  // ---- 4F · Hotel Skyway & Observation Deck ----
  "f4-sky": {
    id: "f4-sky", floor: "4F", image: "f4-sky", blueprint: "blueprint-4f",
    marker: { x: 50, y: 55 }, nameKey: "f4Sky", captionKey: "f4Sky",
    exits: [
      { to: "f4-observation", labelKey: "f4Observation", dir: "right" },
      { to: "f4-restaurants", labelKey: "f4Restaurants", dir: "left" },
      { to: "f3-jr-concourse", labelKey: "backDownToJr", dir: "down" },
    ],
  },
  "f4-observation": {
    id: "f4-observation", floor: "4F", image: "f4-observation", blueprint: "blueprint-4f",
    marker: { x: 50, y: 28 }, nameKey: "f4Observation", captionKey: "f4Observation",
    exits: [{ to: "f4-sky", labelKey: "backToSky", dir: "down" }],
  },
  "f4-restaurants": {
    id: "f4-restaurants", floor: "4F", image: "f4-restaurants", blueprint: "blueprint-4f",
    marker: { x: 22, y: 55 }, nameKey: "f4Restaurants", captionKey: "f4Restaurants",
    exits: [{ to: "f4-sky", labelKey: "backToSky", dir: "down" }],
  },
};

export type SakuraGoalKey = "west" | "jr";

export const sakuraMissions: Record<
  SakuraGoalKey,
  { startNodeId: string; goalNodeId: string }
> = {
  west: { startNodeId: "b3-platform", goalNodeId: "f1-west" },
  jr: { startNodeId: "b3-platform", goalNodeId: "f3-jr-platform" },
};

export const sakuraWalk = {
  id: "sakura-central",
  defaultGoal: "west" as SakuraGoalKey,
  nodes,
};

/** Breadth-first search over the exit graph. */
function bfs(fromId: string, goalId: string): string[] | null {
  if (fromId === goalId) return [fromId];
  const queue: string[] = [fromId];
  const prev: Record<string, string | null> = { [fromId]: null };
  while (queue.length) {
    const cur = queue.shift()!;
    for (const exit of nodes[cur]?.exits ?? []) {
      if (exit.to in prev) continue;
      prev[exit.to] = cur;
      if (exit.to === goalId) {
        const path = [goalId];
        let p: string | null = cur;
        while (p) { path.unshift(p); p = prev[p]; }
        return path;
      }
      queue.push(exit.to);
    }
  }
  return null;
}

/** Next node id on a shortest path from `fromId` to `goalId` (for hints). */
export function nextStepToward(fromId: string, goalId: string): string | null {
  const path = bfs(fromId, goalId);
  return path && path.length > 1 ? path[1] : null;
}

/** Fewest moves from a mission's start to its goal (for the "best route" stat). */
export function optimalSteps(goal: SakuraGoalKey): number {
  const { startNodeId, goalNodeId } = sakuraMissions[goal];
  const path = bfs(startNodeId, goalNodeId);
  return path ? path.length - 1 : 0;
}

export type SakuraWalk = typeof sakuraWalk;
