// Domain vocabulary for the Hero Ops Console. The const arrays are the single
// source for both the TypeScript unions and any select options built from them.

export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

export const CLEARANCE_TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'] as const;
export type ClearanceTier = (typeof CLEARANCE_TIERS)[number];

export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly powerClass: PowerClass;
  /** Power index on a 0-100 scale. */
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearance: ClearanceTier;
  readonly missionCount: number;
  /** Mission success rate as a percentage, 0-100. */
  readonly successRate: number;
  readonly notes: string;
}

/**
 * The fields a dossier edit may change. Clearance and the mission figures are
 * owned by the mission record, not the dossier, so they are not editable here.
 */
export type HeroEdit = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'status' | 'notes'>;

/** The fields a new recruit supplies. A recruit starts in reserve, at the lowest clearance, with no record yet. */
export type NewHero = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'notes'>;
