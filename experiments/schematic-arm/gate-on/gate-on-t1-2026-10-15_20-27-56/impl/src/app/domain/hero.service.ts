import { Service, signal } from '@angular/core';
import { EXAMPLE_HEROES } from './hero.example-data';
import type { Hero } from './hero.model';

/** The editable fields of a hero. The id is fixed once the record exists. */
export type HeroChanges = Partial<Omit<Hero, 'id'>>;

/** A hero before the roster issues an id and seeds the fields the console owns. */
export type NewHero = Omit<Hero, 'id' | 'status' | 'missions' | 'successRate'>;

/**
 * Holds the hero roster as in-memory signal state. There is no backend: the roster is
 * seeded from `EXAMPLE_HEROES` (example data) and resets on every page load, or on `reset()`.
 */
@Service()
export class HeroService {
  private readonly roster = signal<readonly Hero[]>(EXAMPLE_HEROES);

  /** Last roster number issued. Ids are never reused, even after a retirement. */
  private lastNumber = Math.max(...EXAMPLE_HEROES.map((hero) => Number(hero.id.slice(4))));

  /** The whole roster, read-only. Derive views from it with `computed()` in a ViewModel. */
  readonly heroes = this.roster.asReadonly();

  /** Look up one hero by roster id. Returns `undefined` when no hero has that id. */
  byId(id: string): Hero | undefined {
    return this.roster().find((hero) => hero.id === id);
  }

  /** Apply `changes` to the hero with `id`. Unknown ids are a no-op. */
  update(id: string, changes: HeroChanges): void {
    this.roster.update((heroes) => heroes.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)));
  }

  /** Retire a hero: the record leaves the roster. Unknown ids are a no-op. */
  retire(id: string): void {
    this.roster.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  /** Add a new hero to the roster on Reserve, with no missions yet. Returns the new roster id. */
  recruit(draft: NewHero): string {
    this.lastNumber += 1;
    const id = `HRO-${String(this.lastNumber).padStart(4, '0')}`;
    this.roster.update((heroes) => [...heroes, { ...draft, id, status: 'Reserve', missions: 0, successRate: 0 }]);
    return id;
  }

  /** A deployment adds one mission to the record. Only Active heroes can be sent. */
  deploy(id: string): void {
    this.roster.update((heroes) =>
      heroes.map((hero) => (hero.id === id && hero.status === 'Active' ? { ...hero, missions: hero.missions + 1 } : hero)),
    );
  }

  /** Restore the seeded example roster, discarding every change made this session. */
  reset(): void {
    this.roster.set(EXAMPLE_HEROES);
  }
}
