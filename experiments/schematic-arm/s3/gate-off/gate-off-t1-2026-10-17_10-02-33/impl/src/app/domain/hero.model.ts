// The hero domain's vocabulary. Const tuples are the single source for both the
// TypeScript unions and the zod enums in the edit form's schema.
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
  // 0-100.
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearance: ClearanceTier;
  readonly missionCount: number;
  // Percentage, 0-100.
  readonly successRate: number;
}
