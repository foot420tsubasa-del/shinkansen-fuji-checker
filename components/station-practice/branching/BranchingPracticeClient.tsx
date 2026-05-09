"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type {
  Choice,
  Mission,
  StationScene,
} from "@/data/station-practice/branching/types";
import { getBranchingMission } from "@/data/station-practice/branching/missions";
import { TopBar } from "./TopBar";
import { MissionPanel } from "./MissionPanel";
import { SceneViewport } from "./SceneViewport";
import { SignOverlayLayer } from "./SignOverlayLayer";
import { SignZoomModal } from "./SignZoomModal";
import { ChoicePanel } from "./ChoicePanel";
import { HintPanel } from "./HintPanel";
import { MiniMap } from "./MiniMap";
import { FeedbackToast } from "./FeedbackToast";
import { CompletionScreen } from "./CompletionScreen";

/*
 * Orchestrator for the branching mode. Owns the state machine via
 * useReducer and composes all visual pieces together.
 */

type Status = "in-scene" | "wrong-feedback" | "transitioning" | "cleared";

type State = {
  status: Status;
  currentSceneId: string;
  visitedSceneIds: string[];
  hintsUsed: number;
  mistakes: number;
  hintRevealed: boolean;
  lastChoiceId: string | null;
  lastResult: "correct" | "wrong" | "neutral" | null;
  lastFeedback: string | null;
  startedAt: number | null;
  endedAt: number | null;
};

type Action =
  | { type: "START" }
  | { type: "SELECT_CHOICE"; choice: Choice }
  | { type: "ADVANCE_TO"; sceneId: string; clearOnEnter: boolean }
  | { type: "DISMISS_FEEDBACK" }
  | { type: "REVEAL_HINT" }
  | { type: "RESTART"; mission: Mission };

function initialState(mission: Mission): State {
  return {
    status: "in-scene",
    currentSceneId: mission.startSceneId,
    visitedSceneIds: [mission.startSceneId],
    hintsUsed: 0,
    mistakes: 0,
    hintRevealed: false,
    lastChoiceId: null,
    lastResult: null,
    lastFeedback: null,
    startedAt: Date.now(),
    endedAt: null,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return state.startedAt
        ? state
        : { ...state, startedAt: Date.now(), status: "in-scene" };

    case "SELECT_CHOICE": {
      const { choice } = action;
      if (state.status !== "in-scene") return state;
      if (choice.nextSceneId) {
        return {
          ...state,
          status: "transitioning",
          lastChoiceId: choice.id,
          lastResult: choice.result,
          lastFeedback: null,
          mistakes: choice.result === "wrong" ? state.mistakes + 1 : state.mistakes,
        };
      }
      // wrong or neutral: stay on the scene, surface feedback
      return {
        ...state,
        status: "wrong-feedback",
        lastChoiceId: choice.id,
        lastResult: choice.result,
        lastFeedback: choice.feedback ?? null,
        mistakes: choice.result === "wrong" ? state.mistakes + 1 : state.mistakes,
      };
    }

    case "ADVANCE_TO": {
      const cleared = action.clearOnEnter;
      return {
        ...state,
        status: cleared ? "cleared" : "in-scene",
        currentSceneId: action.sceneId,
        visitedSceneIds: state.visitedSceneIds.includes(action.sceneId)
          ? state.visitedSceneIds
          : [...state.visitedSceneIds, action.sceneId],
        hintRevealed: false,
        lastChoiceId: null,
        lastResult: null,
        lastFeedback: null,
        endedAt: cleared ? Date.now() : null,
      };
    }

    case "DISMISS_FEEDBACK":
      return {
        ...state,
        status: "in-scene",
        lastFeedback: null,
        // keep lastChoiceId / lastResult so the wrong button stays red
      };

    case "REVEAL_HINT":
      if (state.hintRevealed) return state;
      return { ...state, hintRevealed: true, hintsUsed: state.hintsUsed + 1 };

    case "RESTART":
      return initialState(action.mission);

    default:
      return state;
  }
}

type Props = {
  missionId?: string | null;
};

export function BranchingPracticeClient({ missionId }: Props) {
  const mission = useMemo(() => getBranchingMission(missionId), [missionId]);
  const [state, dispatch] = useReducer(reducer, mission, initialState);
  const [zoomOpen, setZoomOpen] = useState(false);

  const sceneById = useMemo(() => {
    const m = new Map<string, StationScene>();
    for (const s of mission.scenes) m.set(s.id, s);
    return m;
  }, [mission]);

  const currentScene = sceneById.get(state.currentSceneId);

  // Auto-advance after a choice with a destination scene. Correct picks
  // continue the main route; selected wrong picks can branch into short
  // detour scenes before returning to the decision point.
  useEffect(() => {
    if (state.status !== "transitioning") return;
    if (!currentScene) return;
    const choice = currentScene.choices.find(
      (c) => c.id === state.lastChoiceId,
    );
    if (!choice || !choice.nextSceneId) return;
    const nextId = choice.nextSceneId;
    const nextScene = sceneById.get(nextId);
    if (!nextScene) return;
    const handle = setTimeout(() => {
      dispatch({
        type: "ADVANCE_TO",
        sceneId: nextId,
        clearOnEnter: !!nextScene.clearOnEnter,
      });
    }, 650);
    return () => clearTimeout(handle);
  }, [state.status, state.lastChoiceId, currentScene, sceneById]);

  if (!currentScene) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
        Scene not found.
      </div>
    );
  }

  if (state.status === "cleared" && currentScene.clearOnEnter) {
    const elapsed = state.endedAt && state.startedAt
      ? Math.floor((state.endedAt - state.startedAt) / 1000)
      : 0;
    return (
      <CompletionScreen
        mission={mission}
        clearScene={currentScene}
        elapsedSeconds={elapsed}
        hintsUsed={state.hintsUsed}
        mistakes={state.mistakes}
        onRestart={() => dispatch({ type: "RESTART", mission })}
      />
    );
  }

  const choicesDisabled =
    state.status === "wrong-feedback" || state.status === "transitioning";

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        startedAt={state.startedAt}
        hintsUsed={state.hintsUsed}
        mistakes={state.mistakes}
        progressIndex={currentScene.progressIndex}
        totalGameplayScenes={mission.totalGameplayScenes}
        onInspectSigns={() => setZoomOpen(true)}
        signsAvailable={currentScene.signs.length > 0}
        isDetour={currentScene.isDetour}
      />

      <section className="grid flex-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[300px_1fr_300px]">
        {/* LEFT */}
        <aside className="order-2 flex flex-col gap-4 lg:order-none">
          <MissionPanel mission={mission} scene={currentScene} />
          <MiniMap
            scenes={mission.scenes}
            currentSceneId={state.currentSceneId}
            cleared={state.status === "cleared"}
          />
        </aside>

        {/* CENTER */}
        <div className="order-1 flex flex-col gap-4 lg:order-none">
          <SceneViewport scene={currentScene}>
            <SignOverlayLayer
              signs={currentScene.signs}
              onSignClick={() => setZoomOpen(true)}
            />
          </SceneViewport>

          <div className="flex flex-col items-center gap-3">
            {state.status === "transitioning" && (
              <div className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-medium text-yellow-100">
                {state.lastResult === "wrong"
                  ? "Taking the wrong route..."
                  : currentScene.isDetour
                    ? "Returning to the junction..."
                    : "Following the signs..."}
              </div>
            )}
            <FeedbackToast
              open={
                state.status === "wrong-feedback" &&
                !!state.lastFeedback &&
                !!state.lastResult
              }
              result={state.lastResult}
              message={state.lastFeedback}
              onDismiss={() => dispatch({ type: "DISMISS_FEEDBACK" })}
            />
            <p className="text-center text-xs text-neutral-400">
              Match the sign with your destination, then choose a direction.
            </p>
          </div>

          <ChoicePanel
            choices={currentScene.choices}
            lastChoiceId={state.lastChoiceId}
            lastResult={state.lastResult}
            disabled={choicesDisabled}
            onSelect={(choice) => dispatch({ type: "SELECT_CHOICE", choice })}
          />
        </div>

        {/* RIGHT */}
        <aside className="order-3 flex flex-col gap-4 lg:order-none">
          <HintPanel
            hint={currentScene.hint}
            revealed={state.hintRevealed}
            onReveal={() => dispatch({ type: "REVEAL_HINT" })}
          />
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-xs leading-6 text-neutral-400">
            <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-300">
              About this preview
            </div>
            <p className="mt-2">
              You're playing the branching navigation prototype. Read the
              overhead signs, match the Japanese shape and English label,
              and pick the direction that matches your
              destination.
            </p>
            <p className="mt-2">
              Some wrong choices lead to short detours. They show why the
              route is wrong, then let you return to the decision point.
            </p>
          </section>
        </aside>
      </section>

      <footer className="border-t border-white/5 px-6 py-4 text-xs text-neutral-500">
        Inspired by complex Tokyo-style stations. Layouts, signage, and
        line names are original to this preview.
      </footer>

      <SignZoomModal
        open={zoomOpen}
        signs={currentScene.signs}
        onClose={() => setZoomOpen(false)}
      />
    </div>
  );
}
