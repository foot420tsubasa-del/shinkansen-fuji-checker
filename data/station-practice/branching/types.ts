/*
 * Types for the hidden /station-practice/branching mode.
 *
 * The mode is a graph of station-navigation "scenes": each scene shows a
 * background photo, a few sign overlays (rendered as HTML, not baked into
 * the image), and three branching choices. Wrong choices stay on the same
 * scene and surface an educational explanation; correct choices advance
 * to the next scene id. Naming and signage vocabulary follow the
 * fujiseat hidden-route brand-safety policy (no real station names, no
 * operator marks, generic Japanese wayfinding kanji only).
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
  /** id of the scene this choice transitions to (only used for `correct`). */
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
  /** Background image path. Placeholders today; will be replaced. */
  image: string;
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
