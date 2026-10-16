import { Service, signal } from '@angular/core';
import { EXAMPLE_HEROES } from './hero.data';
import { Hero, HeroDraft, HeroUpdate } from './hero.model';

/**
 * The in-memory hero roster. There is no backend: the roster is a signal seeded
 * with EXAMPLE_HEROES, which is example data. Edits last until the page reloads
 * or the roster is restored.
 *
 * ViewModels read `heroes` (reactively) and call `find`, `add`, `update` and
 * `retire`. Nothing here subscribes to anything.
 */
@Service()
export class HeroService {
  private readonly roster = signal<readonly Hero[]>(EXAMPLE_HEROES);

  /** Numbers the next recruit. Kept apart from the roster length so a retired id is never reissued. */
  private nextNumber = EXAMPLE_HEROES.length + 1;

  /** The whole roster, read-only. */
  readonly heroes = this.roster.asReadonly();

  /** Look a hero up by id. Reads the roster signal, so it is reactive inside `computed`. */
  find(id: string): Hero | undefined {
    return this.roster().find((hero) => hero.id === id);
  }

  /** Enlist a new hero on Reserve with no mission record, and return it. */
  add(draft: HeroDraft): Hero {
    const hero: Hero = {
      ...draft,
      id: `HO-${String(this.nextNumber).padStart(3, '0')}`,
      status: 'Reserve',
      missionCount: 0,
      successRate: 0,
    };
    this.nextNumber += 1;
    this.roster.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /**
   * Apply a partial change to one hero and return the updated record, or
   * `undefined` when no hero has that id. Builds a new roster rather than
   * mutating the old one, so signal consumers see the change.
   */
  update(id: string, patch: HeroUpdate): Hero | undefined {
    const current = this.find(id);
    if (!current) return undefined;
    const updated: Hero = { ...current, ...patch };
    this.roster.update((heroes) => heroes.map((hero) => (hero.id === id ? updated : hero)));
    return updated;
  }

  /** Take one hero off the roster. A hero id that is not on the roster is a no-op. */
  retire(id: string): void {
    this.roster.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  /** Put the roster back to the example data, discarding edits, recruits and retirements. */
  reset(): void {
    this.roster.set(EXAMPLE_HEROES);
    this.nextNumber = EXAMPLE_HEROES.length + 1;
  }
}
