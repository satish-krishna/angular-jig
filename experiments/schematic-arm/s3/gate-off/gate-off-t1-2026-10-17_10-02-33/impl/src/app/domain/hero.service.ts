import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './hero.data';
import type { Hero } from './hero.model';

export type HeroChanges = Partial<Omit<Hero, 'id'>>;

// What a recruit brings. The service gives the new hero an ID and starts them in reserve with no record.
export type NewHero = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearance'>;

// In-memory roster: there is no backend. State lives for the page's lifetime and is seeded with
// EXAMPLE_ROSTER, which is example data.
@Service()
export class HeroService {
  private readonly roster = signal<readonly Hero[]>(EXAMPLE_ROSTER);
  readonly heroes = this.roster.asReadonly();

  byId(id: string): Hero | undefined {
    return this.roster().find((hero) => hero.id === id);
  }

  update(id: string, changes: HeroChanges): void {
    this.roster.update((heroes) => heroes.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)));
  }

  recruit(draft: NewHero): Hero {
    const highest = Math.max(0, ...this.roster().map((hero) => Number(hero.id.slice(4))));
    const hero: Hero = {
      ...draft,
      id: `HRO-${String(highest + 1).padStart(4, '0')}`,
      status: 'Reserve',
      missionCount: 0,
      successRate: 0,
    };
    this.roster.update((heroes) => [...heroes, hero]);
    return hero;
  }

  // Retiring a hero takes them off the roster. Nothing here keeps a record of them afterwards.
  retire(id: string): void {
    this.roster.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  // Puts back the example roster, undoing every recruit, edit and retirement.
  reset(): void {
    this.roster.set(EXAMPLE_ROSTER);
  }
}
