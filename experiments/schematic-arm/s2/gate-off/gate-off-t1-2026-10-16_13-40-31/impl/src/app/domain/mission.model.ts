export const MISSION_RESULTS = ['In field', 'Success', 'Partial', 'Failed'] as const;
export type MissionResult = (typeof MISSION_RESULTS)[number];

export type MissionBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/** Badge look for each mission result. Shared by the mission board and the hero detail screen. */
export const MISSION_RESULT_VARIANTS: Record<MissionResult, MissionBadgeVariant> = {
  'In field': 'outline',
  Success: 'default',
  Partial: 'secondary',
  Failed: 'destructive',
};

/** One deployment in the mission log. */
export interface Mission {
  readonly id: string;
  readonly heroId: string;
  readonly title: string;
  readonly result: MissionResult;
}
