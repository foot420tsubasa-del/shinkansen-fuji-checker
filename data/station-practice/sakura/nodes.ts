/**
 * Sakura Central Station — free-walk node graph.
 *
 * A Street-View / Myst-style navigable map. Each node is one POV viewpoint;
 * each exit is a directional hotspot overlaid on the scene that walks you to a
 * connected viewpoint. Movement is free — you can take detours, hit dead-ends,
 * and backtrack. There is no "wrong answer" punishment; you navigate by reading
 * the Japanese wayfinding signs toward the goal (西口 / West Exit, 1F).
 *
 * Copy lives in messages/*.json under `stationPractice.mission.*`; this file is
 * the language-agnostic graph. Japanese sign tokens stay verbatim in the copy.
 * Images are the optimized webp set under public/images/station-practice/sakura/.
 */

export type ExitDir = "up" | "down" | "left" | "right";

export type SakuraExit = {
  /** Destination node id. */
  to: string;
  /** i18n key under mission.exits.* */
  labelKey: string;
  /** Placement zone + arrow direction of the hotspot. */
  dir: ExitDir;
  /** On the optimal path to the goal — surfaced when the player asks for a hint. */
  recommended?: boolean;
};

export type SakuraNode = {
  id: string;
  /** Floor label, e.g. "B3", "1F". */
  floor: string;
  /** Scene still (without extension) under .../sakura/. */
  image: string;
  /** Floor blueprint (without extension) used as the minimap. */
  blueprint: string;
  /** "You are here" marker position as % of the blueprint image. */
  marker: { x: number; y: number };
  /** i18n keys under mission.nodes.<id>.* */
  nameKey: string;
  captionKey: string;
  exits: SakuraExit[];
  /** Reaching this node completes the mission. */
  goal?: boolean;
};

/** Floors this mission spans, top → bottom (for the minimap rail). */
export const SAKURA_FLOORS = ["1F", "B1", "B2", "B3"] as const;

export const SAKURA_IMAGE_BASE = "/images/station-practice/sakura";

const nodes: Record<string, SakuraNode> = {
  "b3-platform": {
    id: "b3-platform",
    floor: "B3",
    image: "b3-red-platform",
    blueprint: "blueprint-b3",
    marker: { x: 50, y: 58 },
    nameKey: "b3Platform",
    captionKey: "b3Platform",
    exits: [
      { to: "b3-concourse", labelKey: "toB3Concourse", dir: "up", recommended: true },
      { to: "b3-end", labelKey: "b3PlatformEnd", dir: "right" },
    ],
  },
  "b3-end": {
    id: "b3-end",
    floor: "B3",
    image: "b3-platform-end",
    blueprint: "blueprint-b3",
    marker: { x: 72, y: 42 },
    nameKey: "b3End",
    captionKey: "b3End",
    exits: [{ to: "b3-platform", labelKey: "backToPlatform", dir: "down" }],
  },
  "b3-concourse": {
    id: "b3-concourse",
    floor: "B3",
    image: "b3-concourse",
    blueprint: "blueprint-b3",
    marker: { x: 50, y: 40 },
    nameKey: "b3Concourse",
    captionKey: "b3Concourse",
    exits: [
      { to: "b2-hall", labelKey: "escUpToB2", dir: "up", recommended: true },
      { to: "b3-platform", labelKey: "backToPlatform", dir: "down" },
    ],
  },
  "b2-hall": {
    id: "b2-hall",
    floor: "B2",
    image: "b2-hall",
    blueprint: "blueprint-b2",
    marker: { x: 50, y: 50 },
    nameKey: "b2Hall",
    captionKey: "b2Hall",
    exits: [
      { to: "b1-mall", labelKey: "toB1West", dir: "up", recommended: true },
      { to: "b2-platdir", labelKey: "b2PlatformDirs", dir: "right" },
    ],
  },
  "b2-platdir": {
    id: "b2-platdir",
    floor: "B2",
    image: "b2-transfer-hall",
    blueprint: "blueprint-b2",
    marker: { x: 34, y: 56 },
    nameKey: "b2Platdir",
    captionKey: "b2Platdir",
    exits: [{ to: "b2-hall", labelKey: "backToHall", dir: "down" }],
  },
  "b1-mall": {
    id: "b1-mall",
    floor: "B1",
    image: "b1-underground-mall",
    blueprint: "blueprint-b1",
    marker: { x: 48, y: 60 },
    nameKey: "b1Mall",
    captionKey: "b1Mall",
    exits: [
      { to: "f1-concourse", labelKey: "toCentralExit1F", dir: "up", recommended: true },
      { to: "b1-shops", labelKey: "b1Shops", dir: "right" },
    ],
  },
  "b1-shops": {
    id: "b1-shops",
    floor: "B1",
    image: "b1-shops",
    blueprint: "blueprint-b1",
    marker: { x: 66, y: 46 },
    nameKey: "b1Shops",
    captionKey: "b1Shops",
    exits: [{ to: "b1-mall", labelKey: "backToMall", dir: "down" }],
  },
  "f1-concourse": {
    id: "f1-concourse",
    floor: "1F",
    image: "1f-central-plaza",
    blueprint: "blueprint-1f",
    marker: { x: 42, y: 55 },
    nameKey: "f1Concourse",
    captionKey: "f1Concourse",
    exits: [
      { to: "f1-west", labelKey: "west", dir: "left", recommended: true },
      { to: "f1-plaza", labelKey: "centralPlazaOutside", dir: "up" },
    ],
  },
  "f1-plaza": {
    id: "f1-plaza",
    floor: "1F",
    image: "1f-plaza-outdoor",
    blueprint: "blueprint-1f",
    marker: { x: 42, y: 82 },
    nameKey: "f1Plaza",
    captionKey: "f1Plaza",
    exits: [{ to: "f1-concourse", labelKey: "backIndoors", dir: "down" }],
  },
  "f1-west": {
    id: "f1-west",
    floor: "1F",
    image: "1f-west-exit",
    blueprint: "blueprint-1f",
    marker: { x: 22, y: 54 },
    nameKey: "f1West",
    captionKey: "f1West",
    exits: [],
    goal: true,
  },
};

export const sakuraWalk = {
  id: "sakura-red-west",
  startNodeId: "b3-platform",
  goalNodeId: "f1-west",
  /** Fewest moves from start to goal (for the "best route" stat). */
  optimalSteps: 5,
  nodes,
};

export type SakuraWalk = typeof sakuraWalk;
