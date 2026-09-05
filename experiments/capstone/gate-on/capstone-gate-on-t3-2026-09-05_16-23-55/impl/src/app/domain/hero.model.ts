export type PowerClass = 'Aerial' | 'Energy' | 'Psionic' | 'Tech' | 'Mutant' | 'Cosmic' | 'Enhanced';
export type HeroStatus = 'Active' | 'Injured' | 'Reserve' | 'MIA';
export type ClearanceTier = 'Tier1' | 'Tier2' | 'Tier3' | 'Tier4';

export interface Hero {
  id: string;
  name: string;
  alias: string;
  powerClass: PowerClass;
  powerIndex: number; // 0-100
  status: HeroStatus;
  clearanceTier: ClearanceTier;
  missionCount: number;
  successRate: number; // 0-100
}
