import type { StatusVariant } from './hero-presentation';

/** Mission outcomes. Partial and failed missions need follow-up, so they do not take the success colour. */
export const MISSION_OUTCOMES = ['In progress', 'Success', 'Partial', 'Failed'] as const;
export type MissionOutcome = (typeof MISSION_OUTCOMES)[number];

/** Mission outcome to badge variant. */
export const OUTCOME_VARIANT: Readonly<Record<MissionOutcome, StatusVariant>> = {
  'In progress': 'secondary',
  Success: 'success',
  Partial: 'warning',
  Failed: 'destructive',
};

export interface Mission {
  readonly id: string;
  readonly name: string;
  /** The threat this mission responded to. */
  readonly threatId: string;
  /** The heroes deployed on this mission, by roster ID. */
  readonly heroIds: readonly string[];
  /** Calendar date as YYYY-MM-DD, so it sorts correctly as text. */
  readonly date: string;
  readonly outcome: MissionOutcome;
}
