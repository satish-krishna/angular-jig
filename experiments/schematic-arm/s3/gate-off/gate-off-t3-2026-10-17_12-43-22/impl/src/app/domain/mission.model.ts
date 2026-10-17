export const THREAT_TIERS = [1, 2, 3, 4, 5] as const;
export type ThreatTier = (typeof THREAT_TIERS)[number];

export const MISSION_STATUSES = ['Planned', 'In progress', 'Complete', 'Failed'] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

/** The two ways a mission can be settled. */
export type MissionOutcome = Extract<MissionStatus, 'Complete' | 'Failed'>;

export interface Mission {
  readonly id: string;
  readonly codename: string;
  readonly heroId: string;
  readonly threatTier: ThreatTier;
  readonly status: MissionStatus;
  readonly location: string;
}

export function isOpenMission(mission: Mission): boolean {
  return mission.status === 'Planned' || mission.status === 'In progress';
}
