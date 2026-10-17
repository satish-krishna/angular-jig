import type { ClearanceTier } from './hero';

// The mission log: deployments the console has run or is running. Pure types, no DOM, no services.

export const MISSION_STATUSES = ['Live', 'Succeeded', 'Failed'] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

export interface Mission {
  readonly id: string;
  readonly codename: string;
  /** The hero deployed. The hero may have since left the roster, so screens fall back to the id. */
  readonly heroId: string;
  readonly status: MissionStatus;
  /** Threat tier the mission was run against, 1 (routine) to 5 (cosmic). */
  readonly threatTier: ClearanceTier;
  readonly cycle: string;
}
