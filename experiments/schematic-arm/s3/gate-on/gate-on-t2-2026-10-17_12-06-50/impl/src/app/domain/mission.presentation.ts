import type { MissionOutcome } from './mission.model';
import type { ThreatLevel } from './threat.model';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

// Outcome is carried by the badge variant: each result has one fixed look, decided here.
export const OUTCOME_VARIANT: Readonly<Record<MissionOutcome, BadgeVariant>> = {
  'In progress': 'outline',
  Success: 'default',
  Partial: 'secondary',
  Failed: 'destructive',
};

export const LEVEL_VARIANT: Readonly<Record<ThreatLevel, BadgeVariant>> = {
  Low: 'outline',
  Moderate: 'secondary',
  High: 'default',
  Severe: 'destructive',
  Critical: 'destructive',
};
