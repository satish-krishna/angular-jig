/** Power classes used across the roster, filters, and the edit form's select. */
export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

/** Roster status. `Active` is the only status that counts toward live deployments. */
export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

/** Clearance scale: Tier 1 is the lowest, Tier 5 gates cosmic-tier threat responses. */
export const CLEARANCE_TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'] as const;
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
  /** Mission success rate, as a percentage from 0 to 100. */
  readonly successRate: number;
  /** Dossier notes shown on the detail screen and edited in the form. */
  readonly notes: string;
}
