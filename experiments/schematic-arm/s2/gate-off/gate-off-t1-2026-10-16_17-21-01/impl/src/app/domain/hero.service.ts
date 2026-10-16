import { Injectable, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './hero.example-roster';
import type { Hero, NewHero } from './hero.model';

/**
 * Holds the hero roster as in-memory signal state. There is no backend: the roster
 * is EXAMPLE DATA seeded from `hero.example-roster.ts`, and edits last only for the
 * lifetime of the page.
 */
@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly heroes = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The full roster, read-only to consumers. Reading it inside a computed() tracks changes. */
  readonly roster = this.heroes.asReadonly();

  /** Look up one hero by id. Reading it inside a computed() tracks changes. */
  find(id: string): Hero | undefined {
    return this.heroes().find((hero) => hero.id === id);
  }

  /** Recruit a hero onto the roster. Recruits join in Reserve with no missions logged, under the next free HRO number. */
  add(recruit: NewHero): Hero {
    const highest = Math.max(0, ...this.heroes().map((hero) => Number(hero.id.replace(/\D/g, ''))));
    const hero: Hero = {
      ...recruit,
      id: `HRO-${String(highest + 1).padStart(4, '0')}`,
      status: 'Reserve',
      missionCount: 0,
      successRate: 0,
    };
    this.heroes.update((roster) => [...roster, hero]);
    return hero;
  }

  /** Discard every edit and recruit, and restore the example roster. */
  reset(): void {
    this.heroes.set(EXAMPLE_ROSTER);
  }

  /** Apply a partial update to the hero with the given id. Returns the updated hero, or undefined if none matches. */
  update(id: string, changes: Partial<Omit<Hero, 'id'>>): Hero | undefined {
    let updated: Hero | undefined;
    this.heroes.update((roster) =>
      roster.map((hero) => {
        if (hero.id !== id) {
          return hero;
        }
        updated = { ...hero, ...changes };
        return updated;
      }),
    );
    return updated;
  }

  /** Remove the hero with the given id from the roster. Returns true if a hero was removed. */
  retire(id: string): boolean {
    let removed = false;
    this.heroes.update((roster) => {
      const remaining = roster.filter((hero) => hero.id !== id);
      removed = remaining.length !== roster.length;
      return remaining;
    });
    return removed;
  }
}
