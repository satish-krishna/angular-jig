/**
 * The hero domain. Plain types and the closed vocabularies the roster, detail,
 * and edit screens all share, so a power class or status is spelled once.
 */
export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

export const CLEARANCE_TIERS = [1, 2, 3, 4, 5] as const;
export type ClearanceTier = (typeof CLEARANCE_TIERS)[number];

export interface Hero {
  readonly id: string;
  /** Public codename shown in the roster, e.g. "Silverwing". */
  readonly name: string;
  /** Operational alias: the name a hero is filed under, distinct from the codename. */
  readonly alias: string;
  readonly powerClass: PowerClass;
  /** Power index, 0 to 100. */
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearanceTier: ClearanceTier;
  readonly missionCount: number;
  /** Success rate as a fraction, 0 to 1. */
  readonly successRate: number;
}

/** A partial change to a hero's editable fields. The id never changes. */
export type HeroUpdate = Partial<Omit<Hero, 'id'>>;

/** What the recruit form collects. A new hero has no record yet, so the rest is filled in on enlistment. */
export type HeroDraft = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearanceTier'>;
