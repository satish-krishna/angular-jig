/** Power classes a hero can be filed under. Drives the roster class filter and badges. */
export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

/** Roster status. `Active` is the only status a hero can be deployed from. */
export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

/** Clearance tier, 1 (lowest) to 5 (highest). Stored as a number so it sorts; shown as "Tier N". */
export const CLEARANCE_TIERS = [1, 2, 3, 4, 5] as const;
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
  readonly missions: number;
  /** Mission success rate as a percentage, 0-100. */
  readonly successRate: number;
  /** Dossier notes shown on the detail screen and edited in its form. */
  readonly notes: string;
}
