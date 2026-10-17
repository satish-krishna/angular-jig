// The hero domain: the shape every console screen reads. Pure types and constants, no DOM, no services.

export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

export const CLEARANCE_TIERS = [1, 2, 3, 4, 5] as const;
export type ClearanceTier = (typeof CLEARANCE_TIERS)[number];

export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly powerClass: PowerClass;
  /** Power index, 0 to 100. */
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearance: ClearanceTier;
  readonly missionCount: number;
  /** Mission success rate as a percentage, 0 to 100. */
  readonly successRate: number;
  readonly notes: string;
}
