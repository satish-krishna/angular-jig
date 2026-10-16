export const MISSION_OUTCOMES = ['In progress', 'Success', 'Partial', 'Failed'] as const;
export type MissionOutcome = (typeof MISSION_OUTCOMES)[number];

/** One deployment of one hero. The record names the hero by id, so it outlives a retirement. */
export interface Mission {
  readonly id: string;
  readonly heroId: string;
  readonly target: string;
  readonly outcome: MissionOutcome;
}
