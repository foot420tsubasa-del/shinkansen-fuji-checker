/**
 * Sakura Central Station — dense free-walk node graph (all 7 floors).
 *
 * A Street-View / Myst-style navigable map of the whole station, B3 → 4F, with
 * each floor built as a small walkable MESH (6–8 viewpoints) rather than a
 * single corridor — so you can genuinely wander, take detours, ride up to the
 * observation deck, and backtrack. You navigate by reading the Japanese
 * wayfinding signs toward your goal.
 *
 * Two missions share this one graph (BFS auto-routes whichever is active):
 *   - west: B3 Red Metro platform → 1F 西口 (West Exit)
 *   - jr:   B3 Red Metro platform → 3F JR platform (subway → JR transfer)
 *
 * Copy lives in messages/*.json under `stationPractice.mission.*`; this file is
 * language-agnostic. Japanese sign tokens stay verbatim in the copy.
 */

import { exploreNodes, exploreHubLinks } from "./explore";

export type ExitDir = "up" | "down" | "left" | "right";

export type SakuraExit = {
  to: string;
  /** i18n key under mission.exits.* */
  labelKey: string;
  dir: ExitDir;
};

export type SakuraNode = {
  id: string;
  floor: string;
  image: string;
  blueprint: string;
  marker: { x: number; y: number };
  nameKey: string;
  captionKey: string;
  /** Sequence number for generic "explore" viewpoints (rendered after the name). */
  view?: number;
  exits: SakuraExit[];
};

export const SAKURA_FLOORS = ["4F", "3F", "2F", "1F", "B1", "B2", "B3"] as const;
export const SAKURA_IMAGE_BASE = "/images/station-practice/sakura";

// Shorthand for terser node definitions.
const n = (
  id: string,
  floor: string,
  image: string,
  blueprint: string,
  marker: { x: number; y: number },
  key: string,
  exits: SakuraExit[],
): [string, SakuraNode] => [
  id,
  { id, floor, image, blueprint, marker, nameKey: key, captionKey: key, exits },
];
const e = (to: string, labelKey: string, dir: ExitDir): SakuraExit => ({ to, labelKey, dir });

const BP_B3 = "blueprint-b3";
const BP_B2 = "blueprint-b2";
const BP_B1 = "blueprint-b1";
const BP_1F = "blueprint-1f";
const BP_2F = "blueprint-2f";
const BP_3F = "blueprint-3f";
const BP_4F = "blueprint-4f";

const nodes: Record<string, SakuraNode> = Object.fromEntries([
  // ---------------------------------------------------------------- B3
  n("b3-platform", "B3", "b3-red-platform", BP_B3, { x: 50, y: 58 }, "b3Platform", [
    e("b3-concourse", "toB3Concourse", "up"),
    e("b3-platform-mid", "goRight", "right"),
    e("b3-end", "b3PlatformEnd", "left"),
  ]),
  n("b3-end", "B3", "b3-platform-end", BP_B3, { x: 72, y: 42 }, "b3End", [
    e("b3-platform", "backToPlatform", "right"),
  ]),
  n("b3-platform-mid", "B3", "b3-platform-mid", BP_B3, { x: 40, y: 64 }, "b3PlatformMid", [
    e("b3-platform", "goBack", "left"),
    e("b3-platform-far", "goRight", "right"),
    e("b3-gate-hall", "goUp", "up"),
  ]),
  n("b3-platform-far", "B3", "b3-platform-far", BP_B3, { x: 28, y: 70 }, "b3PlatformFar", [
    e("b3-platform-mid", "goBack", "down"),
  ]),
  n("b3-gate-hall", "B3", "b3-gate-hall", BP_B3, { x: 44, y: 46 }, "b3GateHall", [
    e("b3-platform-mid", "goBack", "down"),
    e("b3-gates", "goRight", "right"),
    e("b3-concourse", "goUp", "up"),
  ]),
  n("b3-gates", "B3", "b3-gates", BP_B3, { x: 60, y: 44 }, "b3Gates", [
    e("b3-gate-hall", "goBack", "left"),
    e("b3-down-corridor", "goDown", "down"),
  ]),
  n("b3-down-corridor", "B3", "b3-down-corridor", BP_B3, { x: 66, y: 60 }, "b3DownCorridor", [
    e("b3-gates", "goBack", "up"),
  ]),
  n("b3-concourse", "B3", "b3-concourse", BP_B3, { x: 50, y: 40 }, "b3Concourse", [
    e("b2-hall", "escUpToB2", "up"),
    e("b3-platform", "backToPlatform", "down"),
    e("b3-gate-hall", "goLeft", "left"),
  ]),

  // ---------------------------------------------------------------- B2
  n("b2-hall", "B2", "b2-hall", BP_B2, { x: 50, y: 50 }, "b2Hall", [
    e("b1-mall", "toB1West", "up"),
    e("b2-platdir", "b2PlatformDirs", "right"),
    e("b2-concourse", "goLeft", "left"),
    e("b3-concourse", "goDown", "down"),
  ]),
  n("b2-platdir", "B2", "b2-transfer-hall", BP_B2, { x: 34, y: 56 }, "b2Platdir", [
    e("b2-hall", "backToHall", "down"),
  ]),
  n("b2-concourse", "B2", "b2-concourse", BP_B2, { x: 40, y: 44 }, "b2Concourse", [
    e("b2-hall", "goBack", "right"),
    e("b2-rotunda", "goLeft", "left"),
    e("b2-line-gates", "goUp", "up"),
  ]),
  n("b2-rotunda", "B2", "b2-rotunda", BP_B2, { x: 30, y: 50 }, "b2Rotunda", [
    e("b2-concourse", "goBack", "right"),
    e("b2-line-corridor", "goLeft", "left"),
    e("b2-shops", "goDown", "down"),
  ]),
  n("b2-line-gates", "B2", "b2-line-gates", BP_B2, { x: 44, y: 34 }, "b2LineGates", [
    e("b2-concourse", "goBack", "down"),
  ]),
  n("b2-line-corridor", "B2", "b2-line-corridor", BP_B2, { x: 20, y: 50 }, "b2LineCorridor", [
    e("b2-rotunda", "goBack", "right"),
  ]),
  n("b2-shops", "B2", "b2-shops", BP_B2, { x: 30, y: 64 }, "b2Shops", [
    e("b2-rotunda", "goBack", "up"),
  ]),

  // ---------------------------------------------------------------- B1
  n("b1-mall", "B1", "b1-underground-mall", BP_B1, { x: 48, y: 60 }, "b1Mall", [
    e("f1-concourse", "toCentralExit1F", "up"),
    e("b2-hall", "goDown", "down"),
    e("b1-shops", "b1Shops", "right"),
    e("b1-concourse", "goLeft", "left"),
  ]),
  n("b1-shops", "B1", "b1-shops", BP_B1, { x: 66, y: 46 }, "b1Shops", [
    e("b1-mall", "backToMall", "down"),
  ]),
  n("b1-concourse", "B1", "b1-concourse", BP_B1, { x: 36, y: 58 }, "b1Concourse", [
    e("b1-mall", "goBack", "right"),
    e("b1-foodhall", "goLeft", "left"),
    e("b1-junction", "goUp", "up"),
  ]),
  n("b1-foodhall", "B1", "b1-foodhall", BP_B1, { x: 24, y: 56 }, "b1Foodhall", [
    e("b1-concourse", "goBack", "right"),
  ]),
  n("b1-junction", "B1", "b1-junction", BP_B1, { x: 40, y: 44 }, "b1Junction", [
    e("b1-concourse", "goBack", "down"),
    e("b1-crossing", "goRight", "right"),
    e("b1-up-escalator", "goUp", "up"),
  ]),
  n("b1-crossing", "B1", "b1-crossing", BP_B1, { x: 56, y: 42 }, "b1Crossing", [
    e("b1-junction", "goBack", "left"),
  ]),
  n("b1-up-escalator", "B1", "b1-up-escalator", BP_B1, { x: 42, y: 30 }, "b1UpEscalator", [
    e("f1-concourse", "toCentralExit1F", "up"),
    e("b1-junction", "goBack", "down"),
  ]),

  // ---------------------------------------------------------------- 1F
  n("f1-concourse", "1F", "1f-central-plaza", BP_1F, { x: 42, y: 55 }, "f1Concourse", [
    e("f1-west", "west", "left"),
    e("f2-concourse", "to2FConcourse", "up"),
    e("b1-mall", "goDown", "down"),
    e("f1-concourse-2", "goRight", "right"),
  ]),
  n("f1-west", "1F", "1f-west-exit", BP_1F, { x: 22, y: 54 }, "f1West", [
    e("f1-concourse", "backGeneric", "down"),
  ]),
  n("f1-plaza", "1F", "1f-plaza-outdoor", BP_1F, { x: 42, y: 82 }, "f1Plaza", [
    e("f1-concourse-2", "backIndoors", "down"),
  ]),
  n("f1-concourse-2", "1F", "1f-concourse-2", BP_1F, { x: 54, y: 55 }, "f1Concourse2", [
    e("f1-concourse", "goBack", "left"),
    e("f1-glass-exit", "goRight", "right"),
    e("f1-plaza", "centralPlazaOutside", "up"),
  ]),
  n("f1-glass-exit", "1F", "1f-glass-exit", BP_1F, { x: 68, y: 50 }, "f1GlassExit", [
    e("f1-concourse-2", "goBack", "left"),
    e("f1-east-street", "goDown", "down"),
  ]),
  n("f1-east-street", "1F", "1f-east-street", BP_1F, { x: 78, y: 64 }, "f1EastStreet", [
    e("f1-glass-exit", "goBack", "up"),
    e("f1-outdoor-street", "goRight", "right"),
  ]),
  n("f1-outdoor-street", "1F", "1f-outdoor-street", BP_1F, { x: 88, y: 70 }, "f1OutdoorStreet", [
    e("f1-east-street", "goBack", "left"),
  ]),

  // ---------------------------------------------------------------- 2F
  n("f2-concourse", "2F", "f2-concourse", BP_2F, { x: 50, y: 52 }, "f2Concourse", [
    e("f2-jrgates", "toJrGates", "up"),
    e("f2-westhall", "f2WestHall", "left"),
    e("f1-concourse", "down1FExits", "down"),
    e("f2-concourse-2", "goRight", "right"),
  ]),
  n("f2-jrgates", "2F", "f2-jrgates", BP_2F, { x: 50, y: 38 }, "f2Jrgates", [
    e("f3-jr-concourse", "escUpTo3FJr", "up"),
    e("f2-concourse", "backToConcourse2F", "down"),
  ]),
  n("f2-westhall", "2F", "f2-westhall", BP_2F, { x: 24, y: 52 }, "f2Westhall", [
    e("f2-concourse", "backToConcourse2F", "down"),
  ]),
  n("f2-concourse-2", "2F", "f2-concourse-2", BP_2F, { x: 62, y: 52 }, "f2Concourse2", [
    e("f2-concourse", "goBack", "left"),
    e("f2-east-hall", "goRight", "right"),
    e("f2-fare-gates", "goUp", "up"),
  ]),
  n("f2-fare-gates", "2F", "f2-fare-gates", BP_2F, { x: 56, y: 38 }, "f2FareGates", [
    e("f2-concourse-2", "goBack", "down"),
  ]),
  n("f2-east-hall", "2F", "f2-east-hall", BP_2F, { x: 76, y: 52 }, "f2EastHall", [
    e("f2-concourse-2", "goBack", "left"),
    e("f2-corridor", "goDown", "down"),
  ]),
  n("f2-corridor", "2F", "f2-corridor", BP_2F, { x: 76, y: 64 }, "f2Corridor", [
    e("f2-east-hall", "goBack", "up"),
  ]),

  // ---------------------------------------------------------------- 3F
  n("f3-jr-concourse", "3F", "f3-jr-concourse", BP_3F, { x: 50, y: 60 }, "f3JrConcourse", [
    e("f3-jr-platform", "toJrPlatform", "left"),
    e("f4-sky", "escUpTo4F", "up"),
    e("f3-northdeck", "f3NorthDeck", "right"),
    e("f2-jrgates", "backToGates", "down"),
  ]),
  n("f3-jr-platform", "3F", "f3-jr-platform", BP_3F, { x: 40, y: 44 }, "f3JrPlatform", [
    e("f3-jr-concourse", "backToJrConcourse", "down"),
    e("f3-platform-green", "goRight", "right"),
  ]),
  n("f3-platform-green", "3F", "f3-platform-green", BP_3F, { x: 30, y: 44 }, "f3PlatformGreen", [
    e("f3-jr-platform", "goBack", "left"),
    e("f3-platform-twin", "goRight", "right"),
  ]),
  n("f3-platform-twin", "3F", "f3-platform-twin", BP_3F, { x: 22, y: 40 }, "f3PlatformTwin", [
    e("f3-platform-green", "goBack", "left"),
    e("f3-platform-overview", "goUp", "up"),
  ]),
  n("f3-platform-overview", "3F", "f3-platform-overview", BP_3F, { x: 24, y: 26 }, "f3PlatformOverview", [
    e("f3-platform-twin", "goBack", "down"),
  ]),
  n("f3-northdeck", "3F", "f3-northdeck", BP_3F, { x: 62, y: 28 }, "f3Northdeck", [
    e("f3-jr-concourse", "backToJrConcourse", "down"),
    e("f3-departure-boards", "goRight", "right"),
  ]),
  n("f3-departure-boards", "3F", "f3-departure-boards", BP_3F, { x: 74, y: 30 }, "f3DepartureBoards", [
    e("f3-northdeck", "goBack", "left"),
  ]),

  // ---------------------------------------------------------------- 4F
  n("f4-sky", "4F", "f4-sky", BP_4F, { x: 50, y: 55 }, "f4Sky", [
    e("f3-jr-concourse", "backDownToJr", "down"),
    e("f4-observation", "f4Observation", "right"),
    e("f4-restaurants", "f4Restaurants", "left"),
    e("f4-sky-garden", "goUp", "up"),
  ]),
  n("f4-observation", "4F", "f4-observation", BP_4F, { x: 64, y: 32 }, "f4Observation", [
    e("f4-sky", "backToSky", "down"),
    e("f4-deck-view", "goRight", "right"),
  ]),
  n("f4-deck-view", "4F", "f4-deck-view", BP_4F, { x: 76, y: 28 }, "f4DeckView", [
    e("f4-observation", "goBack", "left"),
    e("f4-night-deck", "goDown", "down"),
  ]),
  n("f4-night-deck", "4F", "f4-night-deck", BP_4F, { x: 78, y: 42 }, "f4NightDeck", [
    e("f4-deck-view", "goBack", "up"),
  ]),
  n("f4-restaurants", "4F", "f4-restaurants", BP_4F, { x: 24, y: 55 }, "f4Restaurants", [
    e("f4-sky", "backToSky", "down"),
    e("f4-lounge", "goLeft", "left"),
  ]),
  n("f4-lounge", "4F", "f4-lounge", BP_4F, { x: 14, y: 52 }, "f4Lounge", [
    e("f4-restaurants", "goBack", "right"),
  ]),
  n("f4-sky-garden", "4F", "f4-sky-garden", BP_4F, { x: 50, y: 30 }, "f4SkyGarden", [
    e("f4-sky", "goBack", "down"),
  ]),
]);

// Fold in every remaining floor viewpoint as a walkable "explore" chain, and
// give each floor's hub a "look around" exit into its chain. This puts all of
// the provided imagery in play so the player can roam each floor freely.
Object.assign(nodes, exploreNodes);
for (const { hub, to, dir } of exploreHubLinks) {
  nodes[hub]?.exits.push({ to, labelKey: "lookAround", dir });
}

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
        while (p) {
          path.unshift(p);
          p = prev[p];
        }
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
