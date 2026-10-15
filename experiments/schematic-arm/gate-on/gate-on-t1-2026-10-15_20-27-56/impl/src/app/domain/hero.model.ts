export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

export const CLEARANCE_TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'] as const;
export type ClearanceTier = (typeof CLEARANCE_TIERS)[number];

export interface Hero {
  /** Roster id, e.g. `HRO-0007`. Never edited. */
  readonly id: string;
  /** Public-facing hero name. */
  readonly name: string;
  /** Civilian identity. `Unknown` or `Classified` where the record is restricted. */
  readonly alias: string;
  readonly powerClass: PowerClass;
  /** Power index, 0-100. */
  readonly power: number;
  readonly status: HeroStatus;
  readonly clearance: ClearanceTier;
  readonly missions: number;
  /** Percentage of missions completed successfully, 0-100. */
  readonly successRate: number;
  /** Free-text dossier shown on the detail screen. */
  readonly dossier: string;
}
