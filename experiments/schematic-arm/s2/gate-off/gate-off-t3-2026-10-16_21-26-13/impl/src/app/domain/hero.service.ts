import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './example-roster';
import type { Hero, HeroEdit, NewHero } from './hero.model';

/**
 * In-memory hero store. There is no backend: the roster is seeded from
 * EXAMPLE_ROSTER, which is example data, and every change lives only until the
 * page reloads.
 */
@Service()
export class HeroService {
  private readonly heroes = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  readonly roster = this.heroes.asReadonly();

  /** Applies a dossier edit to one hero. An unknown id leaves the roster unchanged. */
  update(id: string, changes: Partial<HeroEdit>): void {
    this.heroes.update((list) => list.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)));
  }

  /** Adds a recruit to the roster in reserve, at the lowest clearance. Returns the new hero's id. */
  recruit(details: NewHero): string {
    const id = nextHeroId(this.heroes());
    const hero: Hero = { id, ...details, status: 'Reserve', clearance: 'Tier 1', missionCount: 0, successRate: 0 };
    this.heroes.update((list) => [...list, hero]);
    return id;
  }

  /** Retires a hero: removes them from the active roster. An unknown id leaves the roster unchanged. */
  retire(id: string): void {
    this.heroes.update((list) => list.filter((hero) => hero.id !== id));
  }
}

function nextHeroId(list: readonly Hero[]): string {
  const highest = Math.max(0, ...list.map((hero) => Number.parseInt(hero.id.slice(4), 10) || 0));
  return `HRO-${String(highest + 1).padStart(4, '0')}`;
}
