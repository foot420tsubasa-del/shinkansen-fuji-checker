export type MissionResult = "correct" | "wrong";

export type MissionChoice = {
  id: string;
  label: string;
  sublabel?: string;
  result: MissionResult;
  /**
   * Practical, teaching explanation. Wrong-choice text should explain WHY
   * that route is the wrong move at a real Japanese station, not just say
   * "wrong". Correct-choice text is short — the bigger reason lives on the
   * mission as `correctReason`.
   */
  explanation: string;
};

export type MissionDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type MapPosition = {
  /** percent across the mini-map viewBox (0–100, left → right) */
  x: number;
  /** percent down the mini-map viewBox (0–100, top → bottom) */
  y: number;
};

export type Mission = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  /** What situation the traveler is in — shown in the left mission panel. */
  scenarioIntro: string;
  /** Where the traveler starts the mission. */
  currentLocation: string;
  /** What the traveler is trying to reach. */
  goal: string;
  /** What sign or station clue the traveler should notice ("Look for this"). */
  visualCue: string;
  /** Why the correct choice is right — body of the cleared feedback banner. */
  correctReason: string;
  /** Headline shown when the mission is cleared. */
  clearMessage: string;
  /** Practical lesson revealed after clearing the mission. */
  learningPoint: string;
  /** Short line shown during the "walking to the next area" transition. */
  transitionText: string;
  /** Tip useful for real Japan travel, revealed after clearing the mission. */
  travelTip: string;
  /** On-demand hint to nudge a stuck player. */
  hint: string;
  estimatedMinutes: string;
  difficulty: MissionDifficulty;
  /** thumbnail path used on the landing page mission cards */
  image: string;
  /** full-bleed scene background used on /practice */
  sceneImage: string;
  sceneAlt: string;
  /** big yellow overhead sign text in the scene */
  signText: string;
  /** smaller subtitle under the overhead sign */
  directionLabel: string;
  /** stylized mini-map node coordinates */
  mapPosition: MapPosition;
  choices: MissionChoice[];
};

/** First fallback when a per-mission scene file is missing. */
export const GAMEPLAY_DEFAULT_IMAGE = "/images/station-practice/gameplay-station-bg.png";
/** Last-resort fallback when the gameplay default is also missing. */
export const SCENE_FALLBACK_IMAGE = "/images/station-practice/hero-station-bg.png";

/** Ordered fallback chain for a given per-mission scene src. Deduped, preserves order. */
export function sceneFallbackChain(src: string): string[] {
  const chain: string[] = [src];
  for (const candidate of [GAMEPLAY_DEFAULT_IMAGE, SCENE_FALLBACK_IMAGE]) {
    if (!chain.includes(candidate)) chain.push(candidate);
  }
  return chain;
}

export const missions: Mission[] = [
  {
    id: "m1",
    slug: "hotel-side-exit",
    title: "Find the hotel-side exit",
    shortTitle: "Hotel-side exit",
    scenarioIntro:
      "You just stepped off a Shinkansen at a major Tokyo-style station. Your hotel sits on the Hotel Side of the station — the city-side exit area near the business district. The overhead signs above you branch toward Hotel Side, Central Concourse, East Gate, and West Gate.",
    currentLocation: "Shinkansen arrival concourse",
    goal: "Reach the Hotel Side exit area on foot.",
    visualCue:
      "Look up. The yellow overhead signs name several directions (Hotel Side, Central Concourse, East Gate, West Gate). Pick the side first, the numbered exit second.",
    correctReason:
      "Hotel Side signage points to the city-side exit area where your hotel is. Once you're on this side, the numbered exits (B2, etc.) are a short walk away.",
    clearMessage: "You found the hotel-side exit area.",
    learningPoint:
      "On large Japanese stations, the city-side name (Hotel Side, East Gate, West Gate, etc.) is the most important step in an exit decision. Get the side right first — exit numbers come later.",
    transitionText: "Walking toward the Hotel Side concourse…",
    travelTip:
      "Pick the city-side first, then the numbered exit. Skipping that step costs 10–20 minutes of underground walking.",
    hint: "Your hotel is near the business district. Look for the Hotel Side signs, not East Gate (opposite side) or Central Concourse (stays inside the station).",
    estimatedMinutes: "5–8 min",
    difficulty: "Beginner",
    image: "/images/station-practice/scene-hotel-exit.png",
    sceneImage: "/images/station-practice/scene-hotel-exit.png",
    sceneAlt:
      "A wide station concourse with overhead yellow signage pointing toward Hotel Side, Central Concourse, East Gate, and West Gate.",
    signText: "↑ Hotel Side / 出口",
    directionLabel: "Toward the city-side exits",
    mapPosition: { x: 12, y: 70 },
    choices: [
      {
        id: "c1",
        label: "Hotel Side",
        sublabel: "City-side exits",
        result: "correct",
        explanation:
          "Correct — Hotel Side signs lead to the right city side. From here, the numbered exits (B2, etc.) are a short walk.",
      },
      {
        id: "c2",
        label: "East Gate",
        sublabel: "Opposite city-side exits",
        result: "wrong",
        explanation:
          "The East Gate is the OPPOSITE city side. From here you'd have to cross under the tracks or backtrack through the station to reach a Hotel Side hotel.",
      },
      {
        id: "c3",
        label: "Central Concourse",
        sublabel: "Stays inside the station",
        result: "wrong",
        explanation:
          "Central Concourse keeps you among the platforms and shops in the heart of the station — useful for transfers, not for actually exiting toward your hotel.",
      },
    ],
  },
  {
    id: "m2",
    slug: "express-to-local",
    title: "Transfer from Express to Local Lines",
    shortTitle: "Express → Local",
    scenarioIntro:
      "You arrived on the Shinkansen and need to continue on a Local Line. You're still inside the paid area with a transfer ticket in hand. The overhead signs split between Platform 3-4, Local Lines (transfer), and Platform 5-6 — only one option keeps your transfer valid.",
    currentLocation: "Shinkansen arrival hall, inside the paid zone",
    goal: "Reach the Local Line platforms (Platform 3-4 or 5-6) without losing your transfer ticket.",
    visualCue:
      "Yellow overhead signs with train icons mark Platform 3-4, Local Lines (transfer), and Platform 5-6. Local Lines / 乗換 is the transfer route.",
    correctReason:
      "The Local Lines transfer route keeps you inside the paid zone, validates your transfer ticket, and routes you onto Platform 3-4 or 5-6 depending on your direction.",
    clearMessage: "You're on the Local Lines side.",
    learningPoint:
      "Transferring between Express and Local Lines uses the dedicated Local Lines / 乗換 route, not a normal exit gate. Insert both tickets together — the gate hands them back on the other side.",
    transitionText: "Heading toward Platform 3-4 / 5-6…",
    travelTip:
      "At the orange transfer gate, feed both tickets in at once and pick them up on the other side. Don't separate them.",
    hint: "Look for transfer signage with a train icon, not an exit sign.",
    estimatedMinutes: "5 min",
    difficulty: "Beginner",
    image: "/images/station-practice/scene-local-transfer.png",
    sceneImage: "/images/station-practice/scene-local-transfer.png",
    sceneAlt:
      "A station transfer hall with overhead yellow signs for Platform 3-4, Local Lines, and Platform 5-6.",
    signText: "↑ Local Lines / 乗換",
    directionLabel: "Toward Platform 3-4 / 5-6",
    mapPosition: { x: 30, y: 45 },
    choices: [
      {
        id: "c1",
        label: "Follow Local Lines transfer",
        sublabel: "Orange transfer gates",
        result: "correct",
        explanation:
          "Correct — the orange transfer gate keeps you in the paid area and forwards you onto the local platforms.",
      },
      {
        id: "c2",
        label: "Go through the regular exit gate",
        sublabel: "Out of the station",
        result: "wrong",
        explanation:
          "Regular exit gates take you OUT of the station entirely. You'd need to re-enter and likely buy a fresh local-line ticket — wasted fare and time.",
      },
      {
        id: "c3",
        label: "Follow Subway signage",
        sublabel: "Underground Passage",
        result: "wrong",
        explanation:
          "Subway lines run on a separate operator system. You'd have to exit the local-line area and pay a separate subway fare — and it doesn't go where you're headed anyway.",
      },
    ],
  },
  {
    id: "m3",
    slug: "avoid-wrong-city-side",
    title: "Avoid the wrong city side",
    shortTitle: "Wrong city side",
    scenarioIntro:
      "You're at a station where the West Gate and East Gate sides feel like different cities. Your destination — a quiet hotel near the skyscraper district — is on the West Gate side. The overhead signs and floor decals split between Hotel Side, Opposite Gate, East Gate, and West Gate — and a wrong pick adds 15 minutes of walking.",
    currentLocation: "Multi-corridor junction inside the station",
    goal: "Exit on the West Gate side without wandering into the wrong half.",
    visualCue:
      "Yellow overhead signs and floor decals name the cardinal sides (West Gate / East Gate / Opposite Gate / Hotel Side). Match the side to where your hotel actually is.",
    correctReason:
      "The West Gate puts you on the side of the station closest to the skyscraper district where your hotel is — no underground re-routing needed.",
    clearMessage: "You're on the right side of the station.",
    learningPoint:
      "Picking the wrong side at a major station can add 10–20 minutes of underground walking. Always confirm the side first; the numbered exit comes after.",
    transitionText: "Walking toward the West Gate…",
    travelTip:
      "Confirm 'side' before 'exit number'. Side mistakes cost the most time and the most frustration with luggage.",
    hint: "Skyscrapers and the city government building are on the West Gate side.",
    estimatedMinutes: "6 min",
    difficulty: "Intermediate",
    image: "/images/station-practice/scene-wrong-side.png",
    sceneImage: "/images/station-practice/scene-wrong-side.png",
    sceneAlt:
      "A multi-corridor junction inside a large station with overhead and floor signs pointing to Hotel Side, Opposite Gate, East Gate, and West Gate.",
    signText: "↑ West Gate / 西口",
    directionLabel: "Toward the skyscraper side",
    mapPosition: { x: 50, y: 60 },
    choices: [
      {
        id: "c1",
        label: "West Gate",
        sublabel: "Skyscraper district",
        result: "correct",
        explanation:
          "Correct — the West Gate is the side closest to your hotel.",
      },
      {
        id: "c2",
        label: "East Gate",
        sublabel: "Shopping district",
        result: "wrong",
        explanation:
          "The East Gate drops you into the busy shopping district — the wrong half of the station for a quiet hotel near the skyscrapers. You'd lose ~15 minutes circling back.",
      },
      {
        id: "c3",
        label: "Opposite Gate",
        sublabel: "Service / back-side exit",
        result: "wrong",
        explanation:
          "The Opposite Gate is the back-side exit, far from any hotel district. Useful for service access, wrong for a West Gate-side stay.",
      },
    ],
  },
  {
    id: "m4",
    slug: "long-transfer-corridor",
    title: "Reach the long transfer corridor",
    shortTitle: "Long transfer",
    scenarioIntro:
      "Your next train is on Platform 7-8, which sits at the far end of a long underground corridor. The overhead signs explicitly post an 8-10 minute walking time. You should commit to the long corridor instead of looking for a shortcut that doesn't exist.",
    currentLocation: "Main concourse, near the central platforms",
    goal: "Reach Platform 7-8 via the long underground transfer corridor.",
    visualCue:
      "A yellow overhead sign that explicitly mentions '8-10 min walk' next to a walking-figure pictogram — not a generic transfer arrow.",
    correctReason:
      "The long-corridor sign is honest about the distance. Following it puts you on the moving walkways toward Platform 7-8.",
    clearMessage: "You're on the long-corridor route to Platform 7-8.",
    learningPoint:
      "Some Japanese-station transfers are deliberately long. Trust the sign's posted walking time and budget for it instead of looking for a faster route — there usually isn't one.",
    transitionText: "Starting the long underground walk to Platform 7-8…",
    travelTip:
      "If the sign says 8-10 minutes, trust it. Add buffer time when connecting to or from a far-platform line.",
    hint: "Look for the sign that mentions a posted walking time (8-10 min), not a generic transfer arrow.",
    estimatedMinutes: "10 min",
    difficulty: "Intermediate",
    image: "/images/station-practice/scene-long-corridor.png",
    sceneImage: "/images/station-practice/scene-long-corridor.png",
    sceneAlt:
      "Entrance to a long underground transfer corridor with overhead yellow signs for the 8-10 min corridor, Platform 7-8, and Central Concourse.",
    signText: "↑ Long Transfer Corridor / 8-10 min",
    directionLabel: "Toward Platform 7-8",
    mapPosition: { x: 70, y: 35 },
    choices: [
      {
        id: "c1",
        label: "Follow the long-corridor sign",
        sublabel: "8-10 min walk via moving walkway",
        result: "correct",
        explanation:
          "Correct — the long-corridor sign with the posted 8-10 min walking time is the honest route. Moving walkways keep the pace reasonable.",
      },
      {
        id: "c2",
        label: "Take a generic subway transfer",
        sublabel: "Different operator",
        result: "wrong",
        explanation:
          "That sign points to a subway line, not the train you actually need. You'd cross fare zones for nothing and still have to come back.",
      },
      {
        id: "c3",
        label: "Exit and re-enter from outside",
        sublabel: "Walk above ground",
        result: "wrong",
        explanation:
          "Going outside loses your transfer benefit, costs you a new fare, and is slower in bad weather. The long corridor is faster than it looks.",
      },
    ],
  },
  {
    id: "m5",
    slug: "airport-train-direction",
    title: "Find the airport train direction",
    shortTitle: "Airport train",
    scenarioIntro:
      "You have 25 minutes until your airport train departs and a heavy suitcase on a luggage cart. The dedicated airport-train platform is Platform 1-2, signed with an airport icon — distinct from generic line names.",
    currentLocation: "Lower concourse, near the platform stairs",
    goal: "Reach the dedicated airport-train platform (Platform 1-2) in time.",
    visualCue:
      "Yellow overhead signs for Airport Train, Airport Access (✈ pictogram), and Platform 1-2 — distinct from generic line names.",
    correctReason:
      "The Airport Train sign with the airplane icon points straight to Platform 1-2 — the only route that catches the express on time.",
    clearMessage: "You're on Platform 1-2 — the dedicated airport-train platform.",
    learningPoint:
      "Airport trains have their own dedicated platform and signage. Follow the airport icon, not generic line names — local lines that 'reach the airport area' are slower and risky with limited time.",
    transitionText: "Heading to Platform 1-2 for the airport train…",
    travelTip:
      "For airport trains, follow the airport icon and the dedicated platform number, not a generic line name.",
    hint: "Look for the airplane (✈) icon and Platform 1-2 on the overhead signs.",
    estimatedMinutes: "8 min",
    difficulty: "Advanced",
    image: "/images/station-practice/scene-airport-train.png",
    sceneImage: "/images/station-practice/scene-airport-train.png",
    sceneAlt:
      "A station concourse with overhead yellow signs for Airport Train, Airport Access, and Platform 1-2.",
    signText: "↑ Airport Train / Platform 1-2 / 空港 ✈",
    directionLabel: "Follow the airport icon",
    mapPosition: { x: 88, y: 50 },
    choices: [
      {
        id: "c1",
        label: "Airport-train signage",
        sublabel: "Platform 1-2 — dedicated",
        result: "correct",
        explanation:
          "Correct — the airport icon points straight to Platform 1-2, the dedicated express platform.",
      },
      {
        id: "c2",
        label: "Local line toward the airport area",
        sublabel: "Slow, many stops",
        result: "wrong",
        explanation:
          "A local line technically reaches the airport area but with many stops along the way. With 25 minutes and heavy luggage, you'd likely miss your flight buffer.",
      },
      {
        id: "c3",
        label: "Subway line going downtown",
        sublabel: "Wrong direction",
        result: "wrong",
        explanation:
          "Wrong direction — that subway heads toward the city center, not the airport. You'd lose 15+ minutes before realizing the mistake.",
      },
    ],
  },
];
