import type { Mission } from "./types";
import { mission1 } from "./mission1Scenes";
import { mission2 } from "./mission2Scenes";

export const defaultBranchingMission = mission1;

export const branchingMissions: Mission[] = [mission1, mission2];

export function getBranchingMission(missionId?: string | null): Mission {
  if (!missionId) return defaultBranchingMission;
  return (
    branchingMissions.find(
      (mission) => mission.id === missionId || mission.id.endsWith(missionId),
    ) ?? defaultBranchingMission
  );
}
