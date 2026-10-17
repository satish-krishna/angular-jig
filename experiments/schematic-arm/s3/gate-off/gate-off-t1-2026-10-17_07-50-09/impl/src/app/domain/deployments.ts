import type { Hero } from './hero.model';

// EXAMPLE DATA. Mission names are invented for the demo roster.
const MISSION_NAMES = [
  'Harbour sweep',
  'Quarry rescue',
  'Skyline watch',
  'Sewer breach',
  'Signal relay',
  'Vault escort',
  'Storm front',
  'Night patrol',
] as const;

export interface Deployment {
  readonly id: string;
  readonly name: string;
  readonly won: boolean;
}

/**
 * The most recent deployments for a hero. The roster keeps only a mission count and a
 * success rate, so the log is derived from those and the hero id, not stored.
 */
export function deploymentsFor(hero: Hero, limit: number): readonly Deployment[] {
  const seed = [...hero.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const count = Math.min(limit, hero.missionCount);
  return Array.from({ length: count }, (_, index) => ({
    id: `${hero.id}-${index}`,
    name: MISSION_NAMES[(seed + index) % MISSION_NAMES.length],
    won: (seed + index * 37) % 100 < hero.successRate,
  }));
}
