import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './example-roster';
import type { Hero } from './hero';

/** The fields a recruiter supplies. The service fills in the id and the starting record. */
export type NewHero = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'notes'>;

/**
 * The hero roster as in-memory signal state. There is no backend: the roster is
 * EXAMPLE DATA (see example-roster.ts) and every change lives only until a reload.
 * Singleton, so every ViewModel reads the same roster.
 */
@Service()
export class HeroService {
  private readonly state = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  readonly heroes = this.state.asReadonly();

  findById(id: string): Hero | undefined {
    return this.state().find((hero) => hero.id === id);
  }

  /** Applies a partial change to one hero. Returns the updated hero, or undefined if no hero has that id. */
  update(id: string, changes: Partial<Omit<Hero, 'id'>>): Hero | undefined {
    const current = this.findById(id);
    if (!current) {
      return undefined;
    }
    const updated: Hero = { ...current, ...changes };
    this.state.update((heroes) => heroes.map((hero) => (hero.id === id ? updated : hero)));
    return updated;
  }

  /** Adds a recruit in Reserve, at the lowest clearance tier, with no missions logged. */
  recruit(draft: NewHero): Hero {
    const hero: Hero = {
      ...draft,
      id: this.nextId(),
      status: 'Reserve',
      clearance: 1,
      missionCount: 0,
      successRate: 0,
    };
    this.state.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /** Takes one hero off the roster. Does nothing if no hero has that id. */
  remove(id: string): void {
    this.state.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  /** Puts the example roster back. Used by Settings to undo every session change. */
  reset(): void {
    this.state.set(EXAMPLE_ROSTER);
  }

  // Ids follow HRO-NNNN, so the next one is one past the highest number on the roster.
  private nextId(): string {
    const highest = this.state().reduce((max, hero) => Math.max(max, Number(hero.id.slice(4))), 0);
    return `HRO-${String(highest + 1).padStart(4, '0')}`;
  }
}
