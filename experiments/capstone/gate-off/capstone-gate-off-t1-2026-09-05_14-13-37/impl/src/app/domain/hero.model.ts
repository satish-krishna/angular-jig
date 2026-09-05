export interface Hero {
  id: string;
  name: string;
  alias: string;
  powerClass: string;
  powerIndex: number;
  status: 'Active' | 'Injured' | 'Reserve' | 'MIA';
  clearanceTier: string;
  missionCount: number;
  successRate: number;
  bio?: string;
}
