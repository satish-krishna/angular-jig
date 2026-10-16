/** The power classes a hero can be filed under. */
export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

/** Deployment status. `Active` is the only status that can be sent on a mission. */
export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

/** Clearance tier, 1 (lowest) to 5 (highest). Rendered as "Tier N". */
export const CLEARANCE_TIERS = [1, 2, 3, 4, 5] as const;
export type ClearanceTier = (typeof CLEARANCE_TIERS)[number];

/** A hero on the roster. Power index is 0-100. Success rate is a whole percentage, 0-100. */
export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly powerClass: PowerClass;
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearanceTier: ClearanceTier;
  readonly missionCount: number;
  readonly successRate: number;
  readonly notes: string;
}
