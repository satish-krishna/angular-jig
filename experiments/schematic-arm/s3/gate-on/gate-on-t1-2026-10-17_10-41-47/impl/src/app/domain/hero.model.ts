/** Power classes from the build spec's content section. */
export const POWER_CLASSES = ['Aerial', 'Energy', 'Psionic', 'Tech', 'Mutant', 'Cosmic', 'Enhanced'] as const;
export type PowerClass = (typeof POWER_CLASSES)[number];

/** Roster status. Active, Injured, Reserve and MIA are the spec's four states. */
export const HERO_STATUSES = ['Active', 'Injured', 'Reserve', 'MIA'] as const;
export type HeroStatus = (typeof HERO_STATUSES)[number];

/** Threat clearance tiers, 1 (lowest) to 5 (highest). */
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
  readonly clearanceTier: ClearanceTier;
  readonly missionCount: number;
  /** Mission success rate, as a whole-number percentage (0 to 100). */
  readonly successRate: number;
  /** Free-text dossier notes, edited on the hero detail screen. */
  readonly notes: string;
}

/** The fields the edit form may change. Status, clearance and history are not edited here. */
export type HeroEdit = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'notes'>;

/** A recruit before the roster assigns it an ID. New recruits start in Reserve with no mission history. */
export type NewHero = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearanceTier' | 'notes'>;
