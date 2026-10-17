/** A deployment of one or more heroes. Live missions are open; closed ones carry an outcome. */
export type MissionStatus = 'Live' | 'Closed';
export type MissionOutcome = 'Success' | 'Partial' | 'Aborted';

export interface Mission {
  readonly id: string;
  readonly operation: string;
  /** Hero ids from the roster. A retired hero's id may remain; screens show it as unknown. */
  readonly heroIds: readonly string[];
  /** Display date, e.g. "02 Aug 2026". */
  readonly launched: string;
  readonly status: MissionStatus;
  readonly outcome: MissionOutcome | null;
}
