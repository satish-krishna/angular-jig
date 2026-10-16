/** The power classes a hero can be registered under. */
export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

/** Roster status. MIA means unresolved, not retired. */
export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

/** Clearance tiers run from 1 (lowest) to 5 (highest). */
export type ClearanceTier = 1 | 2 | 3 | 4 | 5;

export interface Hero {
  /** Roster id, e.g. HRO-0007. */
  readonly id: string;
  /** Codename shown on the roster. */
  readonly name: string;
  /** Civilian identity. May read "Unknown" or "Classified". */
  readonly alias: string;
  readonly powerClass: PowerClass;
  /** Power index, 0 to 100. */
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearance: ClearanceTier;
  readonly missionCount: number;
  /** Mission success rate as a percentage, 0 to 100. */
  readonly successRate: number;
  /** Dossier notes shown on the detail screen. */
  readonly notes: string;
}
