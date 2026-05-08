import { create } from "zustand";
import { missions, type Mission } from "@/data/station-practice/missions";

export type GameStatus =
  | "idle"
  | "in-progress"
  | "mission-cleared"
  | "completed";

type GameState = {
  currentIndex: number;
  status: GameStatus;
  hintsUsed: number;
  hintRevealed: boolean;
  lastChoiceId: string | null;
  lastResult: "correct" | "wrong" | null;
  lastExplanation: string | null;
  startedAt: number | null;
  start: () => void;
  selectChoice: (choiceId: string) => void;
  revealHint: () => void;
  next: () => void;
  restart: () => void;
  currentMission: () => Mission;
  totalMissions: () => number;
  clearedCount: () => number;
};

const baseRound = {
  hintRevealed: false,
  lastChoiceId: null,
  lastResult: null,
  lastExplanation: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  currentIndex: 0,
  status: "idle",
  hintsUsed: 0,
  hintRevealed: false,
  lastChoiceId: null,
  lastResult: null,
  lastExplanation: null,
  startedAt: null,

  start: () =>
    set({
      currentIndex: 0,
      status: "in-progress",
      hintsUsed: 0,
      ...baseRound,
      startedAt: Date.now(),
    }),

  selectChoice: (choiceId) => {
    const state = get();
    if (state.status !== "in-progress") return;
    const mission = state.currentMission();
    const choice = mission.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    set({
      lastChoiceId: choiceId,
      lastResult: choice.result,
      lastExplanation: choice.explanation,
      status: choice.result === "correct" ? "mission-cleared" : "in-progress",
    });
  },

  revealHint: () =>
    set((s) =>
      s.hintRevealed
        ? s
        : { hintRevealed: true, hintsUsed: s.hintsUsed + 1 },
    ),

  next: () => {
    const state = get();
    if (state.status !== "mission-cleared") return;
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= missions.length) {
      set({ status: "completed" });
      return;
    }
    set({
      currentIndex: nextIndex,
      status: "in-progress",
      ...baseRound,
    });
  },

  restart: () =>
    set({
      currentIndex: 0,
      status: "in-progress",
      hintsUsed: 0,
      ...baseRound,
      startedAt: Date.now(),
    }),

  currentMission: () => missions[get().currentIndex] ?? missions[0],
  totalMissions: () => missions.length,
  clearedCount: () => {
    const s = get();
    if (s.status === "completed") return missions.length;
    if (s.status === "mission-cleared") return s.currentIndex + 1;
    return s.currentIndex;
  },
}));
