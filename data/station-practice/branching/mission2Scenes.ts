import type { Mission, StationScene } from "./types";

/*
 * Mission 2: Central Concourse → Red Metro Transfer
 *
 * Fictional Sakura Central Station. This mission teaches subway-transfer
 * navigation inside a large Japanese-style terminal without using real
 * operator names, logos, or station layouts.
 *
 * The dedicated Image2 files have not been generated yet. Each scene points
 * to its future /images/station-practice/branching/mission2-*.png path and
 * falls back to existing generic station art until those files are dropped in.
 */

const FALLBACK_GAMEPLAY = "/images/station-practice/gameplay-station-bg.png";
const FALLBACK_HERO = "/images/station-practice/hero-station-bg.png";

const SCENE_IMG = {
  concourse: FALLBACK_GAMEPLAY,
  corridor: "/images/station-practice/scene-long-corridor.png",
  gate: "/images/station-practice/scene-hotel-exit.png",
  platform: "/images/station-practice/scene-local-transfer.png",
  junction: "/images/station-practice/scene-wrong-side.png",
  hero: FALLBACK_HERO,
} as const;

const MISSION2_IMG: Record<string, string> = {
  "mission2-scene-01-central-concourse":
    "/images/station-practice/branching/mission2-scene-01-central-concourse.png",
  "mission2-scene-02-transfer-sign-wall":
    "/images/station-practice/branching/mission2-scene-02-transfer-sign-wall.png",
  "mission2-scene-03-underground-passage-entry":
    "/images/station-practice/branching/mission2-scene-03-underground-passage-entry.png",
  "mission2-scene-04-ticket-gate-split":
    "/images/station-practice/branching/mission2-scene-04-ticket-gate-split.png",
  "mission2-scene-04-detour-outside-gate":
    "/images/station-practice/branching/mission2-scene-04-detour-outside-gate.png",
  "mission2-scene-05-red-metro-corridor":
    "/images/station-practice/branching/mission2-scene-05-red-metro-corridor.png",
  "mission2-scene-05-detour-bayline":
    "/images/station-practice/branching/mission2-scene-05-detour-bayline.png",
  "mission2-scene-06-stair-escalator-choice":
    "/images/station-practice/branching/mission2-scene-06-stair-escalator-choice.png",
  "mission2-scene-07-lower-transfer-hall":
    "/images/station-practice/branching/mission2-scene-07-lower-transfer-hall.png",
  "mission2-scene-08-platform-direction-board":
    "/images/station-practice/branching/mission2-scene-08-platform-direction-board.png",
  "mission2-scene-08-detour-main-rail-platforms":
    "/images/station-practice/branching/mission2-scene-08-detour-main-rail-platforms.png",
  "mission2-scene-09-red-metro-gate":
    "/images/station-practice/branching/mission2-scene-09-red-metro-gate.png",
  "mission2-scene-10-red-metro-arrival":
    "/images/station-practice/branching/mission2-scene-10-red-metro-arrival.png",
};

function buildFallbackChain(placeholder: string): string[] {
  const chain = [placeholder, FALLBACK_GAMEPLAY, FALLBACK_HERO];
  return Array.from(new Set(chain));
}

const scenes: StationScene[] = [
  {
    id: "mission2-scene-01-central-concourse",
    progressIndex: 0,
    image: MISSION2_IMG["mission2-scene-01-central-concourse"],
    fallbackImages: buildFallbackChain(SCENE_IMG.concourse),
    imageAlt:
      "A calm fictional Japanese terminal concourse with overhead signs for subway transfer, ticket gates, and main rail platforms.",
    currentLocation: "Sakura Central Station — Central Concourse",
    missionText:
      "You are in the Central Concourse. Your goal is the Red Metro transfer, not the exit gate or Main Rail platforms.",
    signs: [
      {
        id: "m2s1-subway",
        textJa: "地下鉄のりかえ",
        textEn: "Subway Transfer",
        x: 32,
        y: 14,
        width: 26,
        height: 12,
        direction: "left",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s1-gate",
        textJa: "改札・出口",
        textEn: "Ticket Gate / Exit",
        x: 62,
        y: 14,
        width: 22,
        height: 10,
        direction: "straight",
        tone: "yellow",
      },
      {
        id: "m2s1-main",
        textJa: "メインライン",
        textEn: "Main Rail",
        x: 82,
        y: 16,
        width: 18,
        height: 9,
        direction: "right",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "m2c1a",
        badge: "A",
        labelJa: "地下鉄のりかえへ",
        labelEn: "Follow Subway Transfer",
        result: "correct",
        nextSceneId: "mission2-scene-02-transfer-sign-wall",
        direction: "left",
      },
      {
        id: "m2c1b",
        badge: "B",
        labelJa: "改札・出口へ",
        labelEn: "Head toward the ticket gate / exit",
        result: "wrong",
        feedback:
          "That would move you toward leaving the paid area. For a subway transfer, stay with 地下鉄のりかえ.",
        direction: "straight",
      },
      {
        id: "m2c1c",
        badge: "C",
        labelJa: "メインラインへ",
        labelEn: "Follow Main Rail",
        result: "wrong",
        feedback:
          "Main Rail platforms are a different train system. Your next sign should say 地下鉄のりかえ.",
        direction: "right",
      },
    ],
    hint: "のりかえ means transfer. If you are changing trains, do not follow 出口 yet.",
  },
  {
    id: "mission2-scene-02-transfer-sign-wall",
    progressIndex: 1,
    image: MISSION2_IMG["mission2-scene-02-transfer-sign-wall"],
    fallbackImages: buildFallbackChain(SCENE_IMG.junction),
    imageAlt:
      "A transfer sign wall showing Red Metro, Bay Line, and underground passage directions.",
    currentLocation: "Subway transfer sign wall",
    missionText:
      "The transfer area splits by line. Match the red route label, not just the word transfer.",
    signs: [
      {
        id: "m2s2-red",
        textJa: "レッドメトロ",
        textEn: "Red Metro",
        x: 42,
        y: 14,
        width: 24,
        height: 12,
        direction: "straight",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s2-bay",
        textJa: "ベイライン",
        textEn: "Bay Line",
        x: 72,
        y: 14,
        width: 20,
        height: 10,
        direction: "right",
        tone: "navy",
      },
      {
        id: "m2s2-main",
        textJa: "メインライン",
        textEn: "Main Rail",
        x: 18,
        y: 16,
        width: 18,
        height: 9,
        direction: "back",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "m2c2a",
        badge: "A",
        labelJa: "ベイラインへ",
        labelEn: "Follow Bay Line",
        result: "wrong",
        feedback:
          "Bay Line is another route. Keep matching レッドメトロ and the red-colored signs.",
        direction: "right",
      },
      {
        id: "m2c2b",
        badge: "B",
        labelJa: "レッドメトロへ",
        labelEn: "Follow Red Metro",
        result: "correct",
        nextSceneId: "mission2-scene-03-underground-passage-entry",
        direction: "straight",
      },
      {
        id: "m2c2c",
        badge: "C",
        labelJa: "メインラインへ戻る",
        labelEn: "Return toward Main Rail",
        result: "wrong",
        feedback:
          "Going back to Main Rail would undo the transfer route. Stay with the Red Metro signs.",
        direction: "back",
      },
    ],
    hint: "Large stations often show several transfer lines together. Check the line name and color before walking.",
  },
  {
    id: "mission2-scene-03-underground-passage-entry",
    progressIndex: 2,
    image: MISSION2_IMG["mission2-scene-03-underground-passage-entry"],
    fallbackImages: buildFallbackChain(SCENE_IMG.corridor),
    imageAlt:
      "Entrance to an underground connecting passage with Red Metro and exit signs.",
    currentLocation: "Underground passage entrance",
    missionText:
      "The Red Metro route now continues through an underground connecting passage.",
    signs: [
      {
        id: "m2s3-passage",
        textJa: "地下連絡通路",
        textEn: "Underground Passage",
        x: 48,
        y: 14,
        width: 28,
        height: 12,
        direction: "down",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s3-exit",
        textJa: "出口",
        textEn: "Exit",
        x: 76,
        y: 14,
        width: 14,
        height: 9,
        direction: "right",
        tone: "yellow",
      },
      {
        id: "m2s3-platforms",
        textJa: "3・4番線",
        textEn: "Platforms 3–4",
        x: 20,
        y: 16,
        width: 18,
        height: 9,
        direction: "left",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "m2c3a",
        badge: "A",
        labelJa: "出口へ",
        labelEn: "Follow Exit",
        result: "wrong",
        feedback:
          "Exit signs are for leaving the station area. A transfer route keeps you inside, toward 地下連絡通路.",
        direction: "right",
      },
      {
        id: "m2c3b",
        badge: "B",
        labelJa: "3・4番線へ",
        labelEn: "Go to Platforms 3–4",
        result: "wrong",
        feedback:
          "Platforms 3–4 are Main Rail platforms in this station. Red Metro uses a separate transfer route.",
        direction: "left",
      },
      {
        id: "m2c3c",
        badge: "C",
        labelJa: "地下連絡通路へ",
        labelEn: "Take the underground passage",
        result: "correct",
        nextSceneId: "mission2-scene-04-ticket-gate-split",
        direction: "down",
      },
    ],
    hint: "地下 means underground. 連絡通路 means connecting passage.",
  },
  {
    id: "mission2-scene-04-ticket-gate-split",
    progressIndex: 3,
    image: MISSION2_IMG["mission2-scene-04-ticket-gate-split"],
    fallbackImages: buildFallbackChain(SCENE_IMG.gate),
    imageAlt:
      "A split between a subway transfer gate and an exit ticket gate inside Sakura Central Station.",
    currentLocation: "Gate split",
    missionText:
      "Two gate types are visible. Use the transfer gate, not the exit gate.",
    signs: [
      {
        id: "m2s4-transfer",
        textJa: "地下鉄のりかえ改札",
        textEn: "Subway Transfer Gate",
        x: 35,
        y: 14,
        width: 30,
        height: 12,
        direction: "left",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s4-exit",
        textJa: "出口改札",
        textEn: "Exit Gate",
        x: 70,
        y: 14,
        width: 20,
        height: 10,
        direction: "right",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "m2c4a",
        badge: "A",
        labelJa: "出口改札を通る",
        labelEn: "Use the Exit Gate",
        result: "wrong",
        nextSceneId: "mission2-scene-04-detour-outside-gate",
        feedback:
          "This exits the paid area. You are trying to transfer, so look for 地下鉄のりかえ改札.",
        direction: "right",
      },
      {
        id: "m2c4b",
        badge: "B",
        labelJa: "地下鉄のりかえ改札へ",
        labelEn: "Use the Subway Transfer Gate",
        result: "correct",
        nextSceneId: "mission2-scene-05-red-metro-corridor",
        direction: "left",
      },
      {
        id: "m2c4c",
        badge: "C",
        labelJa: "メインラインへ戻る",
        labelEn: "Return to Main Rail",
        result: "wrong",
        feedback:
          "Main Rail is behind you. The correct gate type is the subway transfer gate.",
        direction: "back",
      },
    ],
    hint: "改札 is a gate. The words before it tell you the gate type: exit gate or transfer gate.",
  },
  {
    id: "mission2-scene-04-detour-outside-gate",
    progressIndex: 3,
    image: MISSION2_IMG["mission2-scene-04-detour-outside-gate"],
    fallbackImages: buildFallbackChain(SCENE_IMG.gate),
    imageAlt:
      "An outside-gate detour showing the player has moved toward the unpaid exit area instead of the subway transfer.",
    currentLocation: "Outside-gate side — wrong branch",
    missionText:
      "You moved toward the exit gate. That is useful if you are leaving the station, but not for a subway transfer.",
    isDetour: true,
    signs: [
      {
        id: "m2s4d-exit",
        textJa: "出口改札",
        textEn: "Exit Gate",
        x: 68,
        y: 14,
        width: 20,
        height: 10,
        direction: "right",
        tone: "yellow",
        important: true,
      },
      {
        id: "m2s4d-return",
        textJa: "地下鉄のりかえへ戻る",
        textEn: "Back to Subway Transfer",
        x: 35,
        y: 16,
        width: 28,
        height: 10,
        direction: "left",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "m2c4d-a",
        badge: "A",
        labelJa: "外へ出る",
        labelEn: "Continue out of the station",
        result: "wrong",
        feedback:
          "That would leave the transfer route. Return to the gate split and choose the subway transfer gate.",
        direction: "right",
      },
      {
        id: "m2c4d-b",
        badge: "B",
        labelJa: "分岐に戻る",
        labelEn: "Return to the gate split",
        result: "correct",
        nextSceneId: "mission2-scene-04-ticket-gate-split",
        direction: "back",
      },
      {
        id: "m2c4d-c",
        badge: "C",
        labelJa: "メインラインを探す",
        labelEn: "Look for Main Rail",
        result: "wrong",
        feedback:
          "Main Rail is not the target. The useful sign here is 地下鉄のりかえ.",
        direction: "left",
      },
    ],
    hint: "If you pass an exit gate too early, pause and return to the transfer sign rather than continuing outside.",
  },
  {
    id: "mission2-scene-05-red-metro-corridor",
    progressIndex: 4,
    image: MISSION2_IMG["mission2-scene-05-red-metro-corridor"],
    fallbackImages: buildFallbackChain(SCENE_IMG.corridor),
    imageAlt:
      "A corridor split with Red Metro signs in one direction and Bay Line signs in another direction.",
    currentLocation: "Subway transfer corridor",
    missionText:
      "You are inside the transfer route. Continue by matching Red Metro, not another line name.",
    signs: [
      {
        id: "m2s5-red",
        textJa: "レッドメトロ",
        textEn: "Red Metro",
        x: 38,
        y: 14,
        width: 24,
        height: 12,
        direction: "left",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s5-bay",
        textJa: "ベイライン",
        textEn: "Bay Line",
        x: 72,
        y: 14,
        width: 20,
        height: 10,
        direction: "right",
        tone: "navy",
      },
      {
        id: "m2s5-platforms",
        textJa: "1・2番線",
        textEn: "Platforms 1–2",
        x: 48,
        y: 28,
        width: 18,
        height: 8,
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "m2c5a",
        badge: "A",
        labelJa: "1・2番線へ",
        labelEn: "Follow Platforms 1–2",
        result: "wrong",
        feedback:
          "Platform numbers help later, but first confirm the line name. Keep following レッドメトロ.",
        direction: "straight",
      },
      {
        id: "m2c5b",
        badge: "B",
        labelJa: "ベイラインへ",
        labelEn: "Follow Bay Line",
        result: "wrong",
        nextSceneId: "mission2-scene-05-detour-bayline",
        feedback:
          "Bay Line is a different route. You need Red Metro.",
        direction: "right",
      },
      {
        id: "m2c5c",
        badge: "C",
        labelJa: "レッドメトロへ",
        labelEn: "Follow Red Metro",
        result: "correct",
        nextSceneId: "mission2-scene-06-stair-escalator-choice",
        direction: "left",
      },
    ],
    hint: "When several railway names appear together, the line name is more important than the nearest arrow.",
  },
  {
    id: "mission2-scene-05-detour-bayline",
    progressIndex: 4,
    image: MISSION2_IMG["mission2-scene-05-detour-bayline"],
    fallbackImages: buildFallbackChain(SCENE_IMG.junction),
    imageAlt:
      "A Bay Line detour corridor showing the player has followed the wrong line color.",
    currentLocation: "Bay Line side — wrong branch",
    missionText:
      "You followed Bay Line. It is well-signed, but it is not the Red Metro transfer.",
    isDetour: true,
    signs: [
      {
        id: "m2s5d-bay",
        textJa: "ベイライン",
        textEn: "Bay Line",
        x: 52,
        y: 14,
        width: 22,
        height: 10,
        direction: "straight",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s5d-return",
        textJa: "レッドメトロへ戻る",
        textEn: "Back to Red Metro",
        x: 28,
        y: 16,
        width: 24,
        height: 10,
        direction: "left",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "m2c5d-a",
        badge: "A",
        labelJa: "ベイラインへ進む",
        labelEn: "Continue toward Bay Line",
        result: "wrong",
        feedback:
          "That continues the wrong line route. Return to the split and match レッドメトロ.",
        direction: "straight",
      },
      {
        id: "m2c5d-b",
        badge: "B",
        labelJa: "分岐に戻る",
        labelEn: "Return to the corridor split",
        result: "correct",
        nextSceneId: "mission2-scene-05-red-metro-corridor",
        direction: "back",
      },
      {
        id: "m2c5d-c",
        badge: "C",
        labelJa: "出口を探す",
        labelEn: "Look for an exit instead",
        result: "wrong",
        feedback:
          "Exit signs do not help with this transfer. The next useful sign is Red Metro.",
        direction: "right",
      },
    ],
    hint: "A wrong line can still look official and clear. Match the exact line name before committing.",
  },
  {
    id: "mission2-scene-06-stair-escalator-choice",
    progressIndex: 5,
    image: MISSION2_IMG["mission2-scene-06-stair-escalator-choice"],
    fallbackImages: buildFallbackChain(SCENE_IMG.corridor),
    imageAlt:
      "Stairs and escalators leading down toward Red Metro, with exit signs pointing upward.",
    currentLocation: "Stair and escalator choice",
    missionText:
      "The Red Metro route goes down through the station. Do not follow the exit signs upward.",
    signs: [
      {
        id: "m2s6-red-down",
        textJa: "レッドメトロ 下へ",
        textEn: "Red Metro downstairs",
        x: 44,
        y: 14,
        width: 28,
        height: 12,
        direction: "down",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s6-exit-up",
        textJa: "出口 上へ",
        textEn: "Exit upstairs",
        x: 72,
        y: 16,
        width: 18,
        height: 9,
        direction: "up",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "m2c6a",
        badge: "A",
        labelJa: "出口へ上がる",
        labelEn: "Go upstairs toward the exit",
        result: "wrong",
        feedback:
          "That would leave the transfer path. Red Metro is signed downward here.",
        direction: "up",
      },
      {
        id: "m2c6b",
        badge: "B",
        labelJa: "下へ進む",
        labelEn: "Go downstairs toward Red Metro",
        result: "correct",
        nextSceneId: "mission2-scene-07-lower-transfer-hall",
        direction: "down",
      },
      {
        id: "m2c6c",
        badge: "C",
        labelJa: "同じ階にとどまる",
        labelEn: "Stay on this concourse level",
        result: "wrong",
        feedback:
          "The sign says 下へ, so staying on this level will not reach the Red Metro gate.",
        direction: "straight",
      },
    ],
    hint: "下 means down. In station signs, vertical arrows are as important as left and right arrows.",
  },
  {
    id: "mission2-scene-07-lower-transfer-hall",
    progressIndex: 6,
    image: MISSION2_IMG["mission2-scene-07-lower-transfer-hall"],
    fallbackImages: buildFallbackChain(SCENE_IMG.gate),
    imageAlt:
      "A lower transfer hall with Red Metro gate signage and nearby platform signs.",
    currentLocation: "Lower transfer hall",
    missionText:
      "You are now in the lower transfer hall. Confirm the Red Metro gate before following platform numbers.",
    signs: [
      {
        id: "m2s7-red-gate",
        textJa: "レッドメトロ 改札",
        textEn: "Red Metro Gate",
        x: 38,
        y: 14,
        width: 26,
        height: 12,
        direction: "straight",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s7-platforms",
        textJa: "3・4番線",
        textEn: "Platforms 3–4",
        x: 72,
        y: 16,
        width: 18,
        height: 9,
        direction: "right",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "m2c7a",
        badge: "A",
        labelJa: "レッドメトロ改札へ",
        labelEn: "Follow the Red Metro gate",
        result: "correct",
        nextSceneId: "mission2-scene-08-platform-direction-board",
        direction: "straight",
      },
      {
        id: "m2c7b",
        badge: "B",
        labelJa: "3・4番線へ",
        labelEn: "Follow Platforms 3–4",
        result: "wrong",
        feedback:
          "Those are Main Rail platform numbers in this station. Confirm the Red Metro gate first.",
        direction: "right",
      },
      {
        id: "m2c7c",
        badge: "C",
        labelJa: "改札を避けて進む",
        labelEn: "Walk around the gate area",
        result: "wrong",
        feedback:
          "For a transfer, the gate type matters. The correct sign says レッドメトロ 改札.",
        direction: "left",
      },
    ],
    hint: "Do not let platform numbers pull you away before you confirm the rail system.",
  },
  {
    id: "mission2-scene-08-platform-direction-board",
    progressIndex: 7,
    image: MISSION2_IMG["mission2-scene-08-platform-direction-board"],
    fallbackImages: buildFallbackChain(SCENE_IMG.platform),
    imageAlt:
      "A Red Metro platform direction board showing platforms 1 and 2 plus a wrong Main Rail platform direction.",
    currentLocation: "Red Metro platform direction board",
    missionText:
      "You have reached the Red Metro platform area. Platform numbers matter now, but only within Red Metro.",
    signs: [
      {
        id: "m2s8-red-p1",
        textJa: "レッドメトロ 1番線",
        textEn: "Red Metro Platform 1",
        x: 30,
        y: 14,
        width: 26,
        height: 12,
        direction: "left",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s8-red-p2",
        textJa: "レッドメトロ 2番線",
        textEn: "Red Metro Platform 2",
        x: 56,
        y: 14,
        width: 24,
        height: 10,
        direction: "right",
        tone: "navy",
      },
      {
        id: "m2s8-main",
        textJa: "メインライン 3・4番線",
        textEn: "Main Rail Platforms 3–4",
        x: 78,
        y: 26,
        width: 24,
        height: 10,
        direction: "right",
        tone: "yellow",
      },
    ],
    choices: [
      {
        id: "m2c8a",
        badge: "A",
        labelJa: "レッドメトロ 1番線へ",
        labelEn: "Go to Red Metro Platform 1",
        result: "correct",
        nextSceneId: "mission2-scene-09-red-metro-gate",
        direction: "left",
      },
      {
        id: "m2c8b",
        badge: "B",
        labelJa: "レッドメトロ 2番線へ",
        labelEn: "Go to Red Metro Platform 2",
        result: "wrong",
        feedback:
          "Platform 2 is still Red Metro, but this exercise is following the Platform 1 direction board.",
        direction: "right",
      },
      {
        id: "m2c8c",
        badge: "C",
        labelJa: "メインライン 3・4番線へ",
        labelEn: "Follow Main Rail Platforms 3–4",
        result: "wrong",
        nextSceneId: "mission2-scene-08-detour-main-rail-platforms",
        feedback:
          "That would send you back to Main Rail platforms, not the subway transfer platform.",
        direction: "right",
      },
    ],
    hint: "Platform numbers are only useful after the line name matches your route.",
  },
  {
    id: "mission2-scene-08-detour-main-rail-platforms",
    progressIndex: 7,
    image: MISSION2_IMG["mission2-scene-08-detour-main-rail-platforms"],
    fallbackImages: buildFallbackChain(SCENE_IMG.platform),
    imageAlt:
      "A wrong-route view near Main Rail platforms 3 and 4, away from the Red Metro transfer.",
    currentLocation: "Main Rail platform side — wrong branch",
    missionText:
      "You followed Main Rail platform signs. These platforms are not part of the Red Metro transfer.",
    isDetour: true,
    signs: [
      {
        id: "m2s8d-main",
        textJa: "メインライン 3・4番線",
        textEn: "Main Rail Platforms 3–4",
        x: 52,
        y: 14,
        width: 28,
        height: 12,
        direction: "straight",
        tone: "yellow",
        important: true,
      },
      {
        id: "m2s8d-return",
        textJa: "レッドメトロへ戻る",
        textEn: "Back to Red Metro",
        x: 28,
        y: 16,
        width: 24,
        height: 10,
        direction: "left",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "m2c8d-a",
        badge: "A",
        labelJa: "3・4番線へ進む",
        labelEn: "Continue to Platforms 3–4",
        result: "wrong",
        feedback:
          "That continues the Main Rail route. Return to the Red Metro direction board.",
        direction: "straight",
      },
      {
        id: "m2c8d-b",
        badge: "B",
        labelJa: "案内板を探す",
        labelEn: "Look for another information board",
        result: "wrong",
        feedback:
          "More information can help, but you already know the mismatch: Main Rail is not Red Metro.",
        direction: "right",
      },
      {
        id: "m2c8d-c",
        badge: "C",
        labelJa: "レッドメトロへ戻る",
        labelEn: "Return to Red Metro",
        result: "correct",
        nextSceneId: "mission2-scene-08-platform-direction-board",
        direction: "back",
      },
    ],
    hint: "When a sign switches from the target line to another rail system, return to the last matching sign.",
  },
  {
    id: "mission2-scene-09-red-metro-gate",
    progressIndex: 8,
    image: MISSION2_IMG["mission2-scene-09-red-metro-gate"],
    fallbackImages: buildFallbackChain(SCENE_IMG.gate),
    imageAlt:
      "A final Red Metro gate area with signs confirming the transfer is almost complete.",
    currentLocation: "Red Metro gate",
    missionText:
      "Final check: the gate and line name both match Red Metro.",
    signs: [
      {
        id: "m2s9-red-gate",
        textJa: "レッドメトロ 改札",
        textEn: "Red Metro Gate",
        x: 44,
        y: 14,
        width: 28,
        height: 12,
        direction: "straight",
        tone: "navy",
        important: true,
      },
      {
        id: "m2s9-bay",
        textJa: "ベイライン",
        textEn: "Bay Line",
        x: 74,
        y: 16,
        width: 18,
        height: 9,
        direction: "right",
        tone: "navy",
      },
    ],
    choices: [
      {
        id: "m2c9a",
        badge: "A",
        labelJa: "中央コンコースへ戻る",
        labelEn: "Return to Central Concourse",
        result: "wrong",
        feedback:
          "You already reached the right transfer gate. There is no need to backtrack now.",
        direction: "back",
      },
      {
        id: "m2c9b",
        badge: "B",
        labelJa: "レッドメトロ改札へ",
        labelEn: "Enter the Red Metro gate",
        result: "correct",
        nextSceneId: "mission2-scene-10-red-metro-arrival",
        direction: "straight",
      },
      {
        id: "m2c9c",
        badge: "C",
        labelJa: "ベイラインへ",
        labelEn: "Follow Bay Line",
        result: "wrong",
        feedback:
          "Bay Line is still the wrong line. The correct gate says レッドメトロ.",
        direction: "right",
      },
    ],
    hint: "At the final gate, match both the rail line and the gate label before entering.",
  },
  {
    id: "mission2-scene-10-red-metro-arrival",
    progressIndex: 9,
    image: MISSION2_IMG["mission2-scene-10-red-metro-arrival"],
    fallbackImages: buildFallbackChain(SCENE_IMG.hero),
    imageAlt:
      "A calm Red Metro platform approach area inside a fictional Japanese terminal station.",
    currentLocation: "Red Metro platform approach",
    missionText:
      "You reached the Red Metro transfer.",
    signs: [],
    choices: [],
    clearOnEnter: true,
    clearSummary:
      "You transferred from Sakura Central Station's Central Concourse to Red Metro by checking the transfer sign, line name, gate type, and platform direction in order.",
    clearLessons: [
      "地下鉄のりかえ means subway transfer, not exit.",
      "Line names matter: Red Metro and Bay Line are different routes even if both are transfers.",
      "Gate type matters: 出口改札 leaves the area, while のりかえ改札 keeps you on the transfer route.",
      "Platform numbers are useful only after the line name matches your destination.",
    ],
  },
];

export const mission2: Mission = {
  id: "branching-mission-2",
  title: "Central Concourse → Red Metro Transfer",
  subtitle: "Mission 2 — Sakura Central Station",
  missionCopy:
    "Follow Japanese-first subway transfer signs through Sakura Central Station and reach the fictional Red Metro without exiting or switching to the wrong rail line.",
  totalGameplayScenes: scenes.filter((s) => !s.clearOnEnter && !s.isDetour)
    .length,
  startSceneId: "mission2-scene-01-central-concourse",
  scenes,
};
