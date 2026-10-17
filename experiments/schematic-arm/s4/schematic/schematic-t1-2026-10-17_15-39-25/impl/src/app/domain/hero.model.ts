export type HeroPowerClass =
  'Aerial' | 'Energy' | 'Psionic' | 'Tech' | 'Mutant' | 'Cosmic' | 'Enhanced';
export type HeroStatus = 'Active' | 'Injured' | 'Reserve' | 'MIA';
export type HeroClearance = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Tier 5';

export interface Hero {
  readonly id: string;
  name: string;
  alias: string;
  powerClass: HeroPowerClass;
  power: number;
  status: HeroStatus;
  clearance: HeroClearance;
  /** ISO date, never a Date object. */
  joined: string;
  missions: number;
  successRate: number;
  notes: string;
}
