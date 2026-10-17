import type { BadgeVariant } from '../hero/hero-presentation';
import type { Mission, MissionOutcome } from './mission.model';

const OUTCOME_VARIANT: Readonly<Record<MissionOutcome, BadgeVariant>> = {
  Success: 'success',
  Partial: 'warning',
  Aborted: 'destructive',
};

/** The badge text for a mission: its outcome once closed, otherwise "Live". */
export const missionLabel = (mission: Mission): string => mission.outcome ?? 'Live';

export const missionVariant = (mission: Mission): BadgeVariant =>
  mission.outcome ? OUTCOME_VARIANT[mission.outcome] : 'default';
