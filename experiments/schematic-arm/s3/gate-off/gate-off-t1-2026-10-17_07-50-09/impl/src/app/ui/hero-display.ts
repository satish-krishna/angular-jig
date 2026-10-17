import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { Hero, HeroStatus } from '../domain/hero.model';

// The one mapping from a hero's status to the badge that shows it. Every screen reads it from here.
export const STATUS_VARIANT: Readonly<Record<HeroStatus, BadgeVariants['variant']>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

/** Up to two initials from a name, for an avatar fallback. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** A hero shaped for a table row: display text and badge variants, no behaviour. */
export interface HeroRow {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly initials: string;
  readonly powerClass: string;
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly statusVariant: BadgeVariants['variant'];
  readonly clearance: string;
  readonly missionCount: number;
  readonly successRate: number;
}

export function toHeroRow(hero: Hero): HeroRow {
  return {
    id: hero.id,
    name: hero.name,
    alias: hero.alias,
    initials: initialsOf(hero.name),
    powerClass: hero.powerClass,
    powerIndex: hero.powerIndex,
    status: hero.status,
    statusVariant: STATUS_VARIANT[hero.status],
    clearance: hero.clearance,
    missionCount: hero.missionCount,
    successRate: hero.successRate,
  };
}
