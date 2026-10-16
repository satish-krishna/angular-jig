import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './hero.example-roster';
import type { Hero } from './hero.model';

/** What a recruit brings to the roster. Status and mission record start fresh. */
export type HeroDraft = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearanceTier' | 'notes'>;

/**
 * The hero roster, held as in-memory signal state. There is no backend: the roster is
 * EXAMPLE DATA from `hero.example-roster.ts`, and edits last only until the page reloads.
 */
@Service()
export class HeroService {
  private readonly roster = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The highest HRO number issued so far. Ids are never reused, even after a retirement. */
  private highestIssued = Math.max(...EXAMPLE_ROSTER.map((hero) => Number(hero.id.slice(4))));

  /** The full roster, read-only to consumers. */
  readonly heroes = this.roster.asReadonly();

  /** Look up one hero by id. Returns `undefined` when no hero has that id. */
  byId(id: string): Hero | undefined {
    return this.roster().find((hero) => hero.id === id);
  }

  /** Apply a partial edit to one hero. The id is fixed and cannot be changed. Unknown ids are a no-op. */
  update(id: string, changes: Partial<Omit<Hero, 'id'>>): void {
    this.roster.update((heroes) =>
      heroes.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)),
    );
  }

  /** Add a recruit to the roster. New recruits enter on Reserve with no mission record. */
  recruit(draft: HeroDraft): Hero {
    this.highestIssued += 1;
    const hero: Hero = {
      ...draft,
      id: `HRO-${String(this.highestIssued).padStart(4, '0')}`,
      status: 'Reserve',
      missionCount: 0,
      successRate: 0,
    };
    this.roster.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /** Retire one hero: remove them from the roster. Unknown ids are a no-op. */
  retire(id: string): void {
    this.roster.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }
}
