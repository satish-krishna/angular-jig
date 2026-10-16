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
  /** Power index, 0-100. */
  readonly powerIndex: number;
  readonly status: HeroStatus;
  readonly clearanceTier: ClearanceTier;
  readonly missionCount: number;
  /** Mission success rate, as a percentage 0-100. */
  readonly successRate: number;
  /** Free-text field notes. EXAMPLE DATA. */
  readonly notes: string;
}

/** The fields a recruit supplies. Status, clearance and mission record start from fixed values. */
export type HeroDraft = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'notes'>;
