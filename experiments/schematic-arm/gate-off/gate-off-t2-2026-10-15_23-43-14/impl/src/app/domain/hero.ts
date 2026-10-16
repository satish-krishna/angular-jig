/** Power classes a hero can belong to. Single source for the type and the form options. */
export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

export const CLEARANCE_TIERS = ['Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'] as const;
export type ClearanceTier = (typeof CLEARANCE_TIERS)[number];

export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly powerClass: PowerClass;
  /** Power index, 0-100. */
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearance: ClearanceTier;
  readonly missionCount: number;
  /** Success rate as a percentage, 0-100. */
  readonly successRate: number;
}

export function isPowerClass(value: unknown): value is PowerClass {
  return POWER_CLASSES.some((powerClass) => powerClass === value);
}

export function isClearanceTier(value: unknown): value is ClearanceTier {
  return CLEARANCE_TIERS.some((tier) => tier === value);
}

/** Missions won and lost, derived from the mission count and the success rate. */
export function missionRecord(hero: Pick<Hero, 'missionCount' | 'successRate'>): { won: number; lost: number } {
  const won = Math.round((hero.missionCount * hero.successRate) / 100);
  return { won, lost: hero.missionCount - won };
}
