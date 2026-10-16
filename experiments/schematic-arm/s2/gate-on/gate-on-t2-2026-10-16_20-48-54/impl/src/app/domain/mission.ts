import type { ClearanceTier } from './hero';

/** Where a deployment stands. A deployment starts In progress and is closed out by an operator. */
export const MISSION_OUTCOMES = ['In progress', 'Success', 'Partial', 'Failed'] as const;
export type MissionOutcome = (typeof MISSION_OUTCOMES)[number];

export interface Mission {
  /** Operation code, e.g. OP-2201. */
  readonly id: string;
  readonly title: string;
  /** Threat tier the operation was run against, 1 (lowest) to 5 (highest). */
  readonly threatTier: ClearanceTier;
  /** Roster ids of the heroes deployed. */
  readonly heroIds: readonly string[];
  readonly outcome: MissionOutcome;
}
