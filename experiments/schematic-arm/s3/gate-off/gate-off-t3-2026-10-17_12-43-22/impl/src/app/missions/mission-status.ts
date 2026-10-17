import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { MissionStatus } from '../domain/mission.model';

type BadgeVariant = NonNullable<BadgeVariants['variant']>;

// A settled result carries meaning, so each status maps to a semantic badge variant.
export const MISSION_STATUS_VARIANT: Readonly<Record<MissionStatus, BadgeVariant>> = {
  Planned: 'secondary',
  'In progress': 'default',
  Complete: 'success',
  Failed: 'destructive',
};
