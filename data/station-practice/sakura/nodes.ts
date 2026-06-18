/**
 * Sakura Central Station — node-navigation trial mission.
 *
 * "Red Metro Line platform (B3) → West Exit (西口, 1F)".
 *
 * This is the language-agnostic scene GRAPH only. All user-facing copy lives in
 * messages/*.json under `stationPractice.mission.*` and is resolved at render
 * time, so the same graph drives all 9 locales. Japanese wayfinding tokens
 * (出口 / 中央出口 / 西口 …) are embedded inside the localized strings because
 * reading those signs is the point of the exercise.
 *
 * Images are the optimized webp set under public/images/station-practice/sakura/.
 */

export type SakuraChoiceKey = "a" | "b" | "c";

export type SakuraChoice = {
  /** Maps to mission.<node>.<key> in the message catalog. */
  key: SakuraChoiceKey;
  /** Exactly one choice per node is correct. */
  correct?: boolean;
  /** Next node id when correct; "clear" finishes the mission. */
  next?: string;
};

export type SakuraNode = {
  id: string;
  /** Floor label shown in the minimap rail, e.g. "B3", "1F". */
  floor: string;
  /** Scene still (without extension) under .../sakura/. */
  image: string;
  /** Floor blueprint (without extension) used as the minimap. */
  blueprint: string;
  /** "You are here" marker position as % of the blueprint image. */
  marker: { x: number; y: number };
  /**
   * Display order of the three choices. The correct option is NOT always first,
   * so players read the signs rather than memorising a button position.
   */
  order: SakuraChoiceKey[];
  choices: Record<SakuraChoiceKey, SakuraChoice>;
};

/** Floors this mission passes through, top → bottom (for the minimap rail). */
export const SAKURA_FLOORS = ["1F", "B1", "B2", "B3"] as const;

export const SAKURA_IMAGE_BASE = "/images/station-practice/sakura";

export const sakuraMission = {
  id: "sakura-red-west",
  startNodeId: "n1",
  totalStops: 4,
  /** Final scene shown after the last correct choice. */
  clear: {
    image: "1f-west-exit",
    floor: "1F",
  },
  nodes: {
    n1: {
      id: "n1",
      floor: "B3",
      image: "b3-red-platform",
      blueprint: "blueprint-b3",
      marker: { x: 50, y: 56 },
      order: ["a", "b", "c"],
      choices: {
        a: { key: "a", correct: true, next: "n2" },
        b: { key: "b" },
        c: { key: "c" },
      },
    },
    n2: {
      id: "n2",
      floor: "B2",
      image: "b2-transfer-hall",
      blueprint: "blueprint-b2",
      marker: { x: 50, y: 58 },
      order: ["b", "a", "c"],
      choices: {
        a: { key: "a", correct: true, next: "n3" },
        b: { key: "b" },
        c: { key: "c" },
      },
    },
    n3: {
      id: "n3",
      floor: "B1",
      image: "b1-underground-mall",
      blueprint: "blueprint-b1",
      marker: { x: 48, y: 60 },
      order: ["a", "c", "b"],
      choices: {
        a: { key: "a", correct: true, next: "n4" },
        b: { key: "b" },
        c: { key: "c" },
      },
    },
    n4: {
      id: "n4",
      floor: "1F",
      image: "1f-central-plaza",
      blueprint: "blueprint-1f",
      marker: { x: 24, y: 54 },
      order: ["c", "a", "b"],
      choices: {
        a: { key: "a", correct: true, next: "clear" },
        b: { key: "b" },
        c: { key: "c" },
      },
    },
  } as Record<string, SakuraNode>,
};

export type SakuraMission = typeof sakuraMission;
