export type PowerClass = 'Aerial' | 'Energy' | 'Psionic' | 'Tech' | 'Mutant' | 'Cosmic' | 'Enhanced';
export type HeroStatus = 'Active' | 'Injured' | 'Reserve' | 'MIA';
export type ClearanceTier = 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4';

export interface Hero {
  readonly id: string;
  name: string;
  alias: string;
  powerClass: PowerClass;
  power: number;
  status: HeroStatus;
  clearanceTier: ClearanceTier;
  missionsRun: number;
  successRate: number;
  threatsFaced: number;
  bio: string;
}
