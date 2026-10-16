export const MISSION_OUTCOMES = ['In progress', 'Success', 'Partial', 'Failed'] as const;
export type MissionOutcome = (typeof MISSION_OUTCOMES)[number];

export interface Mission {
  readonly id: string;
  readonly operation: string;
  readonly heroId: string;
  /** The threat the mission answers, or null for a deployment with no threat assigned. */
  readonly threatId: string | null;
  readonly outcome: MissionOutcome;
  /** The operating cycle the mission ran in. Cycles are counted, not dated, so the console needs no clock. */
  readonly cycle: number;
}
