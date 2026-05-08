import type { Mission, MissionChoice } from "@/data/station-practice/missions";

export type ChoiceOutcome = {
  result: MissionChoice["result"];
  explanation: string;
};

export function evaluateChoice(
  mission: Mission,
  choiceId: string,
): ChoiceOutcome | null {
  const choice = mission.choices.find((c) => c.id === choiceId);
  if (!choice) return null;
  return { result: choice.result, explanation: choice.explanation };
}
