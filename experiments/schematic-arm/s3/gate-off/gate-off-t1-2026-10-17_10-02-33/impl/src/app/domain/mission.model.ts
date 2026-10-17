export const MISSION_STATUSES = ['Live', 'Won', 'Lost'] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

// A deployment of one hero against one threat.
export interface Mission {
  readonly id: string;
  readonly heroId: string;
  readonly threatId: string;
  readonly status: MissionStatus;
}
