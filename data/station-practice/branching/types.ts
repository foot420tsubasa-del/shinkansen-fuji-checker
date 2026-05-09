/*
 * Types for the hidden /station-practice/branching mode.
 *
 * The mode is a graph of station-navigation "scenes": each scene shows a
 * background photo, a few sign overlays (rendered as HTML, not baked into
 * the image), and three branching choices. Wrong choices stay on the same
 * scene and surface an educational explanation; correct choices advance
 * to the next scene id. Naming and signage vocabulary follow the
 * fujiseat hidden-route brand-safety policy (no real station names, no
 * operator marks, generic Japanese wayfinding kanji only). Some wrong
 * choices may branch into short detour scenes before returning to the
 * main route.
 */

export type ChoiceDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "straight"
  | "back";

export type ChoiceResult = "correct" | "wrong" | "neutral";

export type Choice = {
  id: string;
  /** Letter shown on the button (A / B / C). */
  badge: "A" | "B" | "C";
  /** Japanese-first label. */
  labelJa: string;
  /** English secondary label. */
  labelEn: string;
  /** id of the scene this choice transitions to. */
  nextSceneId?: string;
  result: ChoiceResult;
  /** Educational explanation shown after a wrong (or neutral) pick. */
  feedback?: string;
  /** Optional direction cue for a small arrow icon on the button. */
  direction?: ChoiceDirection;
};

export type SignOverlay = {
  id: string;
  /** Japanese-first text — main line on the sign. */
  textJa: string;
  /** English secondary text. */
  textEn: string;
  /**
   * Position of the sign's centre as percentages of the scene viewport.
   * 0..100 left→right and top→bottom. The viewport keeps a fixed 16:9
   * aspect ratio so positions are stable across breakpoints.
   */
  x: number;
  y: number;
  /** Width and height as % of the scene viewport. */
  width: number;
  height: number;
  /** Optional arrow direction shown on the sign panel. */
  direction?: ChoiceDirection;
  /** Tone — yellow is the main wayfinding palette; navy is for transfers. */
  tone?: "yellow" | "navy";
  /** A few signs per scene should be rendered larger / first. */
  important?: boolean;
};

export type StationScene = {
  id: string;
  /**
   * 0-based ordinal in the mission. Drives the mini-map progression and the
   * "Scene N of M" indicator. A clear scene gets the next ordinal after the
   * last gameplay scene.
   */
  progressIndex: number;
  /**
   * Preferred background image path — the dedicated, branching-specific
   * scene image. May not exist on disk yet (the externally-generated
   * Image2 PNGs are dropped in over time). When the request 404s, the
   * SceneViewport advances through `fallbackImages` instead of breaking.
   */
  image: string;
  /**
   * Ordered fallback chain used when `image` fails to load. Conventionally:
   *   1. an existing /images/station-practice/* placeholder picked to
   *      match the scene's mood (e.g. corridor for scene-05);
   *   2. /images/station-practice/gameplay-station-bg.png;
   *   3. /images/station-practice/hero-station-bg.png.
   * Optional — if omitted, only `image` is tried.
   */
  fallbackImages?: string[];
  /** Alt text for the background image. */
  imageAlt: string;
  /** Where the player is right now (e.g. "High-Speed Rail Platform"). */
  currentLocation: string;
  /** Mission-level guidance shown in the mission panel. */
  missionText: string;
  /** Sign overlays rendered on top of the scene image. */
  signs: SignOverlay[];
  /** Three choices, A/B/C. */
  choices: Choice[];
  /** Optional revealable hint. */
  hint?: string;
  /** Short wrong-route branch. Excluded from the main route counter. */
  isDetour?: boolean;
  /**
   * Marks the terminal scene. The client renders the CompletionScreen
   * instead of the normal viewport when this is true.
   */
  clearOnEnter?: boolean;
  /** Short summary shown on the completion screen if `clearOnEnter`. */
  clearSummary?: string;
  /** What the player learned, displayed on the completion screen. */
  clearLessons?: string[];
};

export type Mission = {
  id: string;
  title: string;
  /** Subtitle / one-line goal. */
  subtitle: string;
  /** Generic public-facing copy used on the panel header. */
  missionCopy: string;
  /** Total *gameplay* scenes (excludes the terminal clear scene). */
  totalGameplayScenes: number;
  /** First scene id to mount when the mission starts. */
  startSceneId: string;
  scenes: StationScene[];
};
