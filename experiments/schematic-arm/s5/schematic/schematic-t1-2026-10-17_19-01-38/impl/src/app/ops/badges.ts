import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { MissionOutcome } from '../mission/mission.model';
import type { ThreatStatus } from '../threat/threat.model';

export type BadgeVariant = NonNullable<BadgeVariants['variant']>;

// One mapping per status, shared by every screen that shows it, so a status reads the same everywhere.
const HERO_STATUS_VARIANTS: Readonly<Record<string, BadgeVariant>> = {
  Active: 'default',
  Injured: 'secondary',
  Reserve: 'outline',
  MIA: 'destructive',
};

const MISSION_OUTCOME_VARIANTS: Readonly<Record<MissionOutcome, BadgeVariant>> = {
  Active: 'default',
  Success: 'secondary',
  Partial: 'outline',
  Failed: 'destructive',
};

const THREAT_STATUS_VARIANTS: Readonly<Record<ThreatStatus, BadgeVariant>> = {
  Open: 'destructive',
  Engaged: 'default',
  Contained: 'secondary',
};

export const heroStatusVariant = (status: string): BadgeVariant => HERO_STATUS_VARIANTS[status] ?? 'outline';

export const missionOutcomeVariant = (outcome: MissionOutcome): BadgeVariant => MISSION_OUTCOME_VARIANTS[outcome];

export const threatStatusVariant = (status: ThreatStatus): BadgeVariant => THREAT_STATUS_VARIANTS[status];
