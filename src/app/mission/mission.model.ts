export type MissionStatus = 'Planned' | 'Active' | 'Complete' | 'Failed' | 'Aborted';

export interface Mission {
  readonly id: string;
  codename: string;
  objective: string;
  status: MissionStatus;
  /** Flagged for priority deployment. Drives the missions filter and the form switch. */
  priority: boolean;
  threatId: string | null;
  heroIds: readonly string[];
  /** ISO date, never a Date object. */
  startedOn: string;
  debrief: string;
}
