export const MISSION_STATUSES = ['Live', 'Succeeded', 'Failed'] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

export interface Mission {
  /** Mission id, e.g. "MSN-0001". */
  readonly id: string;
  readonly heroId: string;
  readonly threatId: string;
  readonly status: MissionStatus;
}
