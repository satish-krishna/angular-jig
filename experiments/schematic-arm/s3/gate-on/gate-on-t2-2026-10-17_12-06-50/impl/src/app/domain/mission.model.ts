export const MISSION_OUTCOMES = ['In progress', 'Success', 'Partial', 'Failed'] as const;
export type MissionOutcome = (typeof MISSION_OUTCOMES)[number];

export interface Mission {
  readonly id: string;
  readonly heroId: string;
  readonly threatId: string;
  readonly outcome: MissionOutcome;
  /** Launch date as YYYY-MM-DD. ISO dates sort correctly as strings. */
  readonly launched: string;
}
