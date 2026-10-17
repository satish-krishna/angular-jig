import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { HeroClearance, HeroStatus } from './hero.model';

export type BadgeVariant = NonNullable<BadgeVariants['variant']>;

/** Status tone, shared by every screen that shows a hero's status so they cannot drift apart. */
export const STATUS_BADGE: Readonly<Record<HeroStatus, BadgeVariant>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'outline',
  MIA: 'destructive',
};

export const isHeroStatus = (value: string): value is HeroStatus => Object.hasOwn(STATUS_BADGE, value);

/** Clearance tiers from lowest to highest. A hero may respond to any threat at or below their tier. */
export const CLEARANCE_TIERS: readonly HeroClearance[] = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];

/** What each tier is cleared to respond to. Example data, not an operational rulebook. */
export const CLEARANCE_RESPONSE: Readonly<Record<HeroClearance, string>> = {
  'Tier 1': 'Routine incidents: civilian assists and minor disturbances.',
  'Tier 2': 'Local threats: contained urban incidents.',
  'Tier 3': 'Regional threats: multi-hero operations.',
  'Tier 4': 'National threats: breach and high-altitude response.',
  'Tier 5': 'Cosmic-tier threats: reserved for the heaviest responses.',
};

/** Position of a clearance tier in the ladder, so tiers can be compared. */
export const clearanceRank = (tier: HeroClearance): number => CLEARANCE_TIERS.indexOf(tier);
