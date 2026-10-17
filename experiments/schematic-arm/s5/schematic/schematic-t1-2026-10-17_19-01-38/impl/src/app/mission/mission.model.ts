export type MissionOutcome = 'Active' | 'Success' | 'Partial' | 'Failed';

export interface Mission {
  readonly id: string;
  readonly heroId: string;
  readonly threatId: string;
  readonly outcome: MissionOutcome;
  readonly cycle: number;
}

/** A mission with the threat it targets resolved, so screens never look the threat up themselves. */
export interface MissionRecord extends Mission {
  readonly threatName: string;
  readonly tier: number;
}
