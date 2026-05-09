import type { Mission, StationScene } from "./types";

/*
 * Mission 1: High-Speed Rail Platform → West Central Gate
 *
 * Fictional Japanese-style mega station. No real station names, no
 * operator marks, no exact real signage layout. Vocabulary follows the
 * approved generic list (West Central Gate, East Central Gate, Bay Line,
 * Subway Transfer, Exits A1–A4 / B1–B2, etc.). Japanese kanji used are
 * everyday wayfinding language (改札, 出口, ホーム, 案内所, etc.).
 *
 * IMAGE PIPELINE.
 *
 * Each scene declares the PREFERRED dedicated path under
 * /images/station-practice/branching/<scene-id>.png. Those files are
 * generated externally (Image2 / ChatGPT) and dropped in over time —
 * not committed by Claude or Codex. Until a dedicated PNG is in place,
 * SceneViewport's onError chain falls back through:
 *   1. a mood-matched placeholder from the existing
 *      /images/station-practice/* set (per-scene `fallbackImages[0]`);
 *   2. the universal gameplay default (`gameplay-station-bg.png`);
 *   3. the universal hero (`hero-station-bg.png`).
 *
 * The branching mode never relies on text inside the image — every
 * gameplay-relevant sign is an HTML overlay defined in `signs[]` below.
 * That stays true even after the dedicated images land, so corrections
 * and translations don't require re-rendering art.
 *
 * Drop-in instructions for the 10 dedicated images live in
 * `docs/STATION_PRACTICE_BRANCHING_IMAGE_CHECKLIST.md`.
 */

const FALLBACK_GAMEPLAY = "/images/station-practice/gameplay-station-bg.png";
const FALLBACK_HERO = "/images/station-practice/hero-station-bg.png";

/**
 * Per-scene placeholder picked to roughly match the scene's mood while
 * the dedicated branching image is being generated. These point at the
 * existing /images/station-practice/* art shipped for the 2.5D / 3D
 * routes — they are *not* canonical for the branching mode.
 */
const SCENE_IMG = {
  platform: "/images/station-practice/scene-local-transfer.png",
  midConcourse: FALLBACK_GAMEPLAY,
  upperConcourse: "/images/station-practice/scene-hotel-exit.png",
  multiBranchJunction: "/images/station-practice/scene-wrong-side.png",
  longCorridor: "/images/station-practice/scene-long-corridor.png",
  airportConcourse: "/images/station-practice/scene-airport-train.png",
  hero: FALLBACK_HERO,
} as const;

/**
 * Dedicated branching-mode image paths. Filenames match the scene `id`s
 * exactly so artists / image generators only need the id list to know
 * what to drop in.
 */
const BRANCHING_IMG: Record<string, string> = {
  "scene-01-platform":       "/images/station-practice/branching/scene-01-platform.png",
  "scene-02-escalator":      "/images/station-practice/branching/scene-02-escalator.png",
  "scene-03-stair-landing":  "/images/station-practice/branching/scene-03-stair-landing.png",
  "scene-04-main-concourse": "/images/station-practice/branching/scene-04-main-concourse.png",
  "scene-04-wrong-bayline":  "/images/station-practice/branching/scene-04-wrong-bayline.png",
  "scene-05-branch-corridor":"/images/station-practice/branching/scene-05-branch-corridor.png",
  "scene-06-pre-gate":       "/images/station-practice/branching/scene-06-pre-gate.png",
  "scene-07-ticket-gate":    "/images/station-practice/branching/scene-07-ticket-gate.png",
  "scene-07-wrong-transfer-gate": "/images/station-practice/branching/scene-07-wrong-transfer-gate.png",
  "scene-08-outside-gate":   "/images/station-practice/branching/scene-08-outside-gate.png",
  "scene-09-final-stretch":  "/images/station-practice/branching/scene-09-final-stretch.png",
  "scene-10-clear":          "/images/station-practice/branching/scene-10-clear.png",
};

/**
 * Build the ordered fallback chain for a given placeholder. Deduped so
 * a placeholder that already happens to be one of the universal
 * fallbacks (e.g. `gameplay-station-bg.png`) isn't tried twice.
 */
function buildFallbackChain(placeholder: string): string[] {
  const chain = [placeholder, FALLBACK_GAMEPLAY, FALLBACK_HERO];
  return Array.from(new Set(chain));
}

const scenes: StationScene[] = [
  // -------------------------------------------------------------- 01
  {
    id: "scene-01-platform",
    progressIndex: 0,
    image: BRANCHING_IMG["scene-01-platform"],
    fallbackImages: buildFallbackChain(SCENE_IMG.platform),
    imageAlt:
      "A station platform with overhead Japanese yellow signage and stairs leading up.",
    currentLocation: "High-Speed Rail Platform",
    missionText:
      "You just stepped off a Shinkansen-style high-speed rail train. Start by finding the stairs or escalators up to the concourse.",
    signs: [
      {
        id: "s1-stairs",
        textJa: "中央改札",
        textEn: "Central Gate",
        x: 50,
        y: 12,
        width: 26,
        height: 12,
        direction: "up",
        tone: "yellow",
        important: true,
      },
      {
        id: "s1-platform",
        textJa: "ホーム 1・2番線",
        textEn: "Platforms 1–2",
        x: 18,
        y: 14,
        width: 20,
        height: 8,
        tone: "yellow",
      },
      {
        id: "s1-exit",
        textJa: "のりかえ",
        textEn: "Transfers",
        x: 80,
        y: 14,
        width: 16,
        height: 8,
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c1a",
        badge: "A",
        labelJa: "階段を上がる",
        labelEn: "Go up the stairs",
        result: "correct",
        nextSceneId: "scene-02-escalator",
        direction: "up",
      },
      {
        id: "c1b",
        badge: "B",
        labelJa: "ホームの先まで歩く",
        labelEn: "Walk to the far end of the platform",
        result: "wrong",
        feedback:
          "The far end of the platform usually leads to more platform space, not the station exit. Look for stairs or escalators marked 改札.",
        direction: "straight",
      },
      {
        id: "c1c",
        badge: "C",
        labelJa: "電車の方へ戻る",
        labelEn: "Walk back toward the train",
        result: "wrong",
        feedback:
          "Walking back along the platform usually just retraces your steps. The exit route starts with the stairs or escalators.",
        direction: "back",
      },
    ],
    hint: "Look for signs marked 改札 (kaisatsu / gate). The gate area is up the stairs.",
  },

  // -------------------------------------------------------------- 02
  {
    id: "scene-02-escalator",
    progressIndex: 1,
    image: BRANCHING_IMG["scene-02-escalator"],
    fallbackImages: buildFallbackChain(SCENE_IMG.midConcourse),
    imageAlt:
      "Top of the platform escalator, opening onto a wider station concourse.",
    currentLocation: "Top of the platform escalator",
    missionText:
      "You're at the top of the escalator. From here, follow signs toward the Central Gate concourse.",
    signs: [
      {
        id: "s2-central",
        textJa: "中央改札",
        textEn: "Central Gate",
        x: 50,
        y: 14,
        width: 26,
        height: 12,
        direction: "straight",
        tone: "yellow",
        important: true,
      },
      {
        id: "s2-restroom",
        textJa: "トイレ",
        textEn: "Restrooms",
        x: 80,
        y: 14,
        width: 14,
        height: 8,
        tone: "navy",
      },
      {
        id: "s2-platform",
        textJa: "ホーム",
        textEn: "Platform",
        x: 18,
        y: 14,
        width: 14,
        height: 8,
        direction: "back",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c2a",
        badge: "A",
        labelJa: "トイレへ向かう",
        labelEn: "Head toward the restrooms",
        result: "wrong",
        feedback:
          "Restrooms (トイレ) are useful but they're a side-stop, not the gate. Look for the 改札 sign first.",
        direction: "right",
      },
      {
        id: "c2b",
        badge: "B",
        labelJa: "中央改札へ進む",
        labelEn: "Walk toward the Central Gate",
        result: "correct",
        nextSceneId: "scene-03-stair-landing",
        direction: "straight",
      },
      {
        id: "c2c",
        badge: "C",
        labelJa: "ホームへ戻る",
        labelEn: "Go back down to the platform",
        result: "wrong",
        feedback:
          "You'd be back where you started. The next step is forward toward the gate.",
        direction: "back",
      },
    ],
    hint: "When you see 中央改札 (Central Gate) on a sign, it usually means the main exit hall — the right direction at this stage.",
  },

  // -------------------------------------------------------------- 03
  {
    id: "scene-03-stair-landing",
    progressIndex: 2,
    image: BRANCHING_IMG["scene-03-stair-landing"],
    fallbackImages: buildFallbackChain(SCENE_IMG.upperConcourse),
    imageAlt:
      "An upper-concourse landing with overhead yellow signage branching multiple ways.",
    currentLocation: "Upper concourse",
    missionText:
      "You're on the upper concourse. The next sign tells you which side of the station the West Central Gate is on.",
    signs: [
      {
        id: "s3-west",
        textJa: "中央西口",
        textEn: "West Central Gate",
        x: 28,
        y: 12,
        width: 24,
        height: 12,
        direction: "left",
        tone: "yellow",
        important: true,
      },
      {
        id: "s3-east",
        textJa: "中央東口",
        textEn: "East Central Gate",
        x: 72,
        y: 12,
        width: 24,
        height: 12,
        direction: "right",
        tone: "yellow",
      },
      {
        id: "s3-info",
        textJa: "案内所",
        textEn: "Information",
        x: 50,
        y: 14,
        width: 16,
        height: 8,
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c3a",
        badge: "A",
        labelJa: "案内図を探す",
        labelEn: "Look for a station map first",
        result: "wrong",
        feedback:
          "A map can help if you're lost, but the overhead sign already gives the side you need. Follow 中央西口 first.",
        direction: "straight",
      },
      {
        id: "c3b",
        badge: "B",
        labelJa: "中央東口へ進む",
        labelEn: "Head right toward the East Central Gate",
        result: "wrong",
        feedback:
          "East Central Gate is the other side of the station. If your destination is on the West side, this can add 10–15 minutes of walking.",
        direction: "right",
      },
      {
        id: "c3c",
        badge: "C",
        labelJa: "中央西口へ進む",
        labelEn: "Head left toward the West Central Gate",
        result: "correct",
        nextSceneId: "scene-04-main-concourse",
        direction: "left",
      },
    ],
    hint: "中央西口 means West Central Gate. 西 = west. The kanji is the same as on a compass.",
  },

  // -------------------------------------------------------------- 04
  {
    id: "scene-04-main-concourse",
    progressIndex: 3,
    image: BRANCHING_IMG["scene-04-main-concourse"],
    fallbackImages: buildFallbackChain(SCENE_IMG.multiBranchJunction),
    imageAlt:
      "A main station concourse with a three-way junction and overhead signs for several lines.",
    currentLocation: "Main concourse — three-way junction",
    missionText:
      "Three branches: West Central Gate, Bay Line, and Subway Transfer. Stay on the West Central Gate route.",
    signs: [
      {
        id: "s4-west",
        textJa: "中央西口",
        textEn: "West Central Gate",
        x: 22,
        y: 14,
        width: 22,
        height: 12,
        direction: "left",
        tone: "yellow",
        important: true,
      },
      {
        id: "s4-bay",
        textJa: "ベイライン",
        textEn: "Bay Line",
        x: 50,
        y: 14,
        width: 18,
        height: 10,
        direction: "straight",
        tone: "navy",
      },
      {
        id: "s4-subway",
        textJa: "地下鉄のりかえ",
        textEn: "Subway Transfer",
        x: 78,
        y: 14,
        width: 22,
        height: 10,
        direction: "right",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c4a",
        badge: "A",
        labelJa: "ベイラインへ",
        labelEn: "Head toward the Bay Line",
        result: "wrong",
        nextSceneId: "scene-04-bay-line-detour",
        feedback:
          "Bay Line is a train connection, not an exit route. You need the West Central Gate sign.",
        direction: "straight",
      },
      {
        id: "c4b",
        badge: "B",
        labelJa: "地下鉄のりかえへ",
        labelEn: "Follow Subway Transfer",
        result: "wrong",
        feedback:
          "Subway Transfer is a different connection zone. Stay with the gate name rather than changing operators.",
        direction: "right",
      },
      {
        id: "c4c",
        badge: "C",
        labelJa: "中央西口の通路へ",
        labelEn: "Take the West Central Gate corridor",
        result: "correct",
        nextSceneId: "scene-05-branch-corridor",
        direction: "left",
      },
    ],
    hint: "When the same kanji 中央西口 appears on a smaller sign repeating from earlier, it means you're still on the right track — keep following it.",
  },

  // -------------------------------------------------------------- 04A DETOUR
  {
    id: "scene-04-bay-line-detour",
    progressIndex: 3,
    image: BRANCHING_IMG["scene-04-wrong-bayline"],
    fallbackImages: buildFallbackChain(SCENE_IMG.multiBranchJunction),
    imageAlt:
      "A main concourse junction where the Bay Line direction pulls away from the exit route.",
    currentLocation: "Bay Line passage — wrong branch",
    missionText:
      "You followed the Bay Line sign. This is a train connection, not the West Central Gate exit path.",
    isDetour: true,
    signs: [
      {
        id: "s4d-bay",
        textJa: "ベイライン",
        textEn: "Bay Line",
        x: 50,
        y: 14,
        width: 18,
        height: 10,
        direction: "straight",
        tone: "navy",
        important: true,
      },
      {
        id: "s4d-return",
        textJa: "中央西口へ戻る",
        textEn: "Return to West Central Gate",
        x: 25,
        y: 18,
        width: 24,
        height: 10,
        direction: "left",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "c4d-a",
        badge: "A",
        labelJa: "ベイラインへ進む",
        labelEn: "Continue toward Bay Line platforms",
        result: "wrong",
        feedback:
          "That would take you deeper into a transfer route. You are looking for an exit gate, not another train.",
        direction: "straight",
      },
      {
        id: "c4d-b",
        badge: "B",
        labelJa: "前の分岐に戻る",
        labelEn: "Return to the previous junction",
        result: "correct",
        nextSceneId: "scene-04-main-concourse",
        direction: "back",
      },
      {
        id: "c4d-c",
        badge: "C",
        labelJa: "地下鉄の案内を探す",
        labelEn: "Look for subway signs instead",
        result: "wrong",
        feedback:
          "Subway signs are useful for transfers, but they do not help you reach the West Central Gate exit.",
        direction: "right",
      },
    ],
    hint: "If the sign switches from a gate name to a line name, you may have left the exit route. Return to the last sign that said 中央西口.",
  },

  // -------------------------------------------------------------- 05
  {
    id: "scene-05-branch-corridor",
    progressIndex: 4,
    image: BRANCHING_IMG["scene-05-branch-corridor"],
    fallbackImages: buildFallbackChain(SCENE_IMG.multiBranchJunction),
    imageAlt:
      "A wide branching corridor with three possible paths and overhead signage.",
    currentLocation: "Branch corridor",
    missionText:
      "Three corridors. The West Central ticket gate is via the left corridor.",
    signs: [
      {
        id: "s5-westgate",
        textJa: "中央西改札",
        textEn: "West Central Ticket Gate",
        x: 26,
        y: 12,
        width: 28,
        height: 14,
        direction: "left",
        tone: "yellow",
        important: true,
      },
      {
        id: "s5-exitsB",
        textJa: "出口 B1・B2",
        textEn: "Exits B1–B2",
        x: 78,
        y: 14,
        width: 22,
        height: 10,
        direction: "right",
        tone: "yellow",
      },
      {
        id: "s5-platform",
        textJa: "中央コンコース",
        textEn: "Central Concourse",
        x: 50,
        y: 14,
        width: 22,
        height: 10,
        direction: "straight",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c5a",
        badge: "A",
        labelJa: "まっすぐ進む",
        labelEn: "Go straight",
        result: "wrong",
        feedback:
          "Straight ahead leads back toward the platforms / Central Concourse — not the West Central Gate.",
        direction: "straight",
      },
      {
        id: "c5b",
        badge: "B",
        labelJa: "左の通路へ",
        labelEn: "Take the left corridor",
        result: "correct",
        nextSceneId: "scene-06-pre-gate",
        direction: "left",
      },
      {
        id: "c5c",
        badge: "C",
        labelJa: "B出口方面へ進む",
        labelEn: "Follow the B-exits direction",
        result: "wrong",
        feedback:
          "B1–B2 are a different exit group. Stay with the West Central Ticket Gate before choosing your A-numbered exit.",
        direction: "right",
      },
    ],
    hint: "改札 (ticket gate) and 出口 (exit) often appear together. The 西改札 (West Ticket Gate) is the first checkpoint before reaching the A-numbered exits outside.",
  },

  // -------------------------------------------------------------- 06
  {
    id: "scene-06-pre-gate",
    progressIndex: 5,
    image: BRANCHING_IMG["scene-06-pre-gate"],
    fallbackImages: buildFallbackChain(SCENE_IMG.longCorridor),
    imageAlt:
      "A long underground corridor leading toward a row of ticket gates in the distance.",
    currentLocation: "Pre-gate corridor",
    missionText:
      "Walk forward. The West Central Ticket Gate is at the end of this corridor.",
    signs: [
      {
        id: "s6-gate",
        textJa: "中央西改札",
        textEn: "West Central Ticket Gate",
        x: 50,
        y: 10,
        width: 32,
        height: 14,
        direction: "straight",
        tone: "yellow",
        important: true,
      },
      {
        id: "s6-exits",
        textJa: "出口 A1–A4",
        textEn: "Exits A1–A4",
        x: 50,
        y: 26,
        width: 22,
        height: 8,
        direction: "straight",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "c6a",
        badge: "A",
        labelJa: "左側の掲示板を見る",
        labelEn: "Check the wall information board",
        result: "wrong",
        feedback:
          "Information boards can confirm details, but the gate sign is already straight ahead. Keep moving toward 中央西改札.",
        direction: "left",
      },
      {
        id: "c6b",
        badge: "B",
        labelJa: "戻る",
        labelEn: "Turn back",
        result: "wrong",
        feedback:
          "You're on the right corridor. Going back would just send you to the previous junction.",
        direction: "back",
      },
      {
        id: "c6c",
        badge: "C",
        labelJa: "改札に向かって進む",
        labelEn: "Walk forward to the ticket gate",
        result: "correct",
        nextSceneId: "scene-07-ticket-gate",
        direction: "straight",
      },
    ],
    hint: "Corridors with one large overhead sign repeating the gate name usually mean: keep walking — you're committed to that gate.",
  },

  // -------------------------------------------------------------- 07
  {
    id: "scene-07-ticket-gate",
    progressIndex: 6,
    image: BRANCHING_IMG["scene-07-ticket-gate"],
    fallbackImages: buildFallbackChain(SCENE_IMG.platform),
    imageAlt:
      "A row of silver ticket gates with overhead signage above the gate row.",
    currentLocation: "West Central Ticket Gate",
    missionText:
      "You're at the gate. Pass through the exit gate toward A1–A4, not the Subway Transfer passage.",
    signs: [
      {
        id: "s7-exit",
        textJa: "出口 A1–A4",
        textEn: "Exits A1–A4",
        x: 35,
        y: 14,
        width: 26,
        height: 12,
        direction: "straight",
        tone: "yellow",
        important: true,
      },
      {
        id: "s7-transfer",
        textJa: "地下鉄のりかえ",
        textEn: "Subway Transfer",
        x: 75,
        y: 14,
        width: 22,
        height: 12,
        direction: "right",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c7a",
        badge: "A",
        labelJa: "地下鉄のりかえへ",
        labelEn: "Use the Subway Transfer passage",
        result: "wrong",
        nextSceneId: "scene-07-subway-transfer-detour",
        feedback:
          "Subway Transfer is for changing to another rail system. Your destination is outside the gate.",
        direction: "right",
      },
      {
        id: "c7b",
        badge: "B",
        labelJa: "改札を通る（出口）",
        labelEn: "Pass through the Exit gate",
        result: "correct",
        nextSceneId: "scene-08-outside-gate",
        direction: "straight",
      },
      {
        id: "c7c",
        badge: "C",
        labelJa: "戻る",
        labelEn: "Turn back",
        result: "wrong",
        feedback:
          "You're at the right gate. Going back at this point would just delay things by a few minutes.",
        direction: "back",
      },
    ],
    hint: "出口 means you are leaving the paid area. のりかえ means you are transferring to another train route.",
  },

  // -------------------------------------------------------------- 07A DETOUR
  {
    id: "scene-07-subway-transfer-detour",
    progressIndex: 6,
    image: BRANCHING_IMG["scene-07-wrong-transfer-gate"],
    fallbackImages: buildFallbackChain(SCENE_IMG.platform),
    imageAlt:
      "A ticket gate area where the Subway Transfer direction leads away from the station exit.",
    currentLocation: "Subway Transfer side — wrong branch",
    missionText:
      "You moved toward the Subway Transfer passage. This is useful if you are changing trains, but it is not the exit to West Central Plaza.",
    isDetour: true,
    signs: [
      {
        id: "s7d-transfer",
        textJa: "地下鉄のりかえ",
        textEn: "Subway Transfer",
        x: 75,
        y: 14,
        width: 22,
        height: 12,
        direction: "right",
        tone: "navy",
        important: true,
      },
      {
        id: "s7d-exit",
        textJa: "出口 A1–A4へ戻る",
        textEn: "Back to Exits A1–A4",
        x: 36,
        y: 14,
        width: 26,
        height: 12,
        direction: "left",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "c7d-a",
        badge: "A",
        labelJa: "地下鉄へ進む",
        labelEn: "Continue toward the subway",
        result: "wrong",
        feedback:
          "That keeps you inside the transfer area. For this route, return to the exit gate marked 出口 A1–A4.",
        direction: "right",
      },
      {
        id: "c7d-b",
        badge: "B",
        labelJa: "出口改札へ戻る",
        labelEn: "Return to the Exit gate",
        result: "correct",
        nextSceneId: "scene-07-ticket-gate",
        direction: "back",
      },
      {
        id: "c7d-c",
        badge: "C",
        labelJa: "券売機を探す",
        labelEn: "Look for ticket machines",
        result: "wrong",
        feedback:
          "Ticket machines are nearby, but buying another ticket is not needed for this route. Return to the exit gate.",
        direction: "left",
      },
    ],
    hint: "If the sign says のりかえ, pause. For this mission, you want 出口, not another train connection.",
  },

  // -------------------------------------------------------------- 08
  {
    id: "scene-08-outside-gate",
    progressIndex: 7,
    image: BRANCHING_IMG["scene-08-outside-gate"],
    fallbackImages: buildFallbackChain(SCENE_IMG.airportConcourse),
    imageAlt:
      "A station hall just outside a ticket gate with overhead signs for numbered exits.",
    currentLocation: "Just outside the West Central Ticket Gate",
    missionText:
      "You've cleared the gate. Now find the A-exits group that includes A2 — the one closest to the West Central plaza.",
    signs: [
      {
        id: "s8-exitA1A2",
        textJa: "出口 A1・A2",
        textEn: "Exits A1–A2",
        x: 30,
        y: 12,
        width: 22,
        height: 12,
        direction: "left",
        tone: "yellow",
        important: true,
      },
      {
        id: "s8-exitA3A4",
        textJa: "出口 A3・A4",
        textEn: "Exits A3–A4",
        x: 70,
        y: 12,
        width: 22,
        height: 12,
        direction: "right",
        tone: "yellow",
      },
      {
        id: "s8-info",
        textJa: "中央西口 広場",
        textEn: "West Central Plaza",
        x: 50,
        y: 26,
        width: 22,
        height: 8,
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c8a",
        badge: "A",
        labelJa: "改札の中へ戻る",
        labelEn: "Go back inside the gate",
        result: "wrong",
        feedback:
          "You are already outside the paid area. Going back through the gate is unnecessary and may require asking station staff.",
        direction: "back",
      },
      {
        id: "c8b",
        badge: "B",
        labelJa: "A3・A4 の出口へ",
        labelEn: "Head toward Exits A3–A4",
        result: "wrong",
        feedback:
          "A3–A4 exit on the south side. You'd come out further from the plaza you want — solvable, but a longer walk.",
        direction: "right",
      },
      {
        id: "c8c",
        badge: "C",
        labelJa: "A1・A2 の出口へ",
        labelEn: "Head toward Exits A1–A2",
        result: "correct",
        nextSceneId: "scene-09-final-stretch",
        direction: "left",
      },
    ],
    hint: "A pair of exit numbers on one sign (A1·A2) means those exits share a hall. Pick the pair that matches your final destination.",
  },

  // -------------------------------------------------------------- 09
  {
    id: "scene-09-final-stretch",
    progressIndex: 8,
    image: BRANCHING_IMG["scene-09-final-stretch"],
    fallbackImages: buildFallbackChain(SCENE_IMG.upperConcourse),
    imageAlt:
      "A short final corridor with daylight visible at the end and a Plaza sign overhead.",
    currentLocation: "Exit A2 — final stretch",
    missionText:
      "Daylight ahead. The West Central plaza is right outside the door labelled A2.",
    signs: [
      {
        id: "s9-exitA2",
        textJa: "出口 A2 中央西口広場",
        textEn: "Exit A2 / West Central Plaza",
        x: 50,
        y: 12,
        width: 32,
        height: 14,
        direction: "straight",
        tone: "yellow",
        important: true,
      },
      {
        id: "s9-info",
        textJa: "案内所",
        textEn: "Information",
        x: 78,
        y: 16,
        width: 16,
        height: 8,
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "c9a",
        badge: "A",
        labelJa: "出口 A2 から外へ",
        labelEn: "Step out through Exit A2",
        result: "correct",
        nextSceneId: "scene-10-clear",
        direction: "straight",
      },
      {
        id: "c9b",
        badge: "B",
        labelJa: "案内所に立ち寄る",
        labelEn: "Stop at the information desk",
        result: "wrong",
        feedback:
          "The 案内所 is helpful, but you've already arrived. Step out to the plaza — the signs already match your destination.",
        direction: "right",
      },
      {
        id: "c9c",
        badge: "C",
        labelJa: "中に戻る",
        labelEn: "Walk back inside",
        result: "wrong",
        feedback:
          "You're one step from the plaza. Don't backtrack.",
        direction: "back",
      },
    ],
    hint: "When the overhead sign repeats your destination's name (中央西口広場 / West Central Plaza), the door under it is your exit.",
  },

  // -------------------------------------------------------------- 10  TERMINAL
  {
    id: "scene-10-clear",
    progressIndex: 9,
    image: BRANCHING_IMG["scene-10-clear"],
    fallbackImages: buildFallbackChain(SCENE_IMG.hero),
    imageAlt:
      "A wide station view of the West Central plaza with daylight and the city visible.",
    currentLocation: "West Central Gate plaza",
    missionText:
      "You reached the West Central Gate.",
    signs: [],
    choices: [],
    clearOnEnter: true,
    clearSummary:
      "You navigated from the High-Speed Rail platform out to the West Central Gate by reading signs in order: side first, gate name next, exit number last.",
    clearLessons: [
      "At many large stations, the first step after the platform is up to the concourse — look for stairs or escalators marked 改札.",
      "Pick the city side (西口 / 東口) before the numbered exit.",
      "出口 means exit. のりかえ means transfer to another train route.",
      "When overhead signs repeat your destination name, you're on the right corridor — keep walking.",
    ],
  },
];

export const mission1: Mission = {
  id: "branching-mission-1",
  title: "High-Speed Rail Platform → West Central Gate",
  subtitle: "Mission 1 — Sakura Central Station",
  missionCopy:
    "You arrived by High-Speed Rail at a fictional Tokyo-style mega station. Find your way to the West Central Gate by reading the overhead signs.",
  totalGameplayScenes: scenes.filter((s) => !s.clearOnEnter && !s.isDetour).length,
  startSceneId: "scene-01-platform",
  scenes,
};
