import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { HeroStatus } from '../domain/hero.model';
import type { MissionOutcome } from '../domain/mission.model';

export type BadgeVariant = NonNullable<BadgeVariants['variant']>;

// Each status gets its own semantic badge; MIA is the destructive one.
export const STATUS_BADGE: Record<HeroStatus, BadgeVariant> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

// A deployment still in progress is neutral until its outcome is known.
export const OUTCOME_BADGE: Record<MissionOutcome, BadgeVariant> = {
  'In progress': 'secondary',
  Success: 'success',
  Partial: 'warning',
  Failed: 'destructive',
};

/** The two-letter monogram for an alias: "Tessa Harrow" becomes "TH". */
export function initialsOf(alias: string): string {
  return alias
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}
