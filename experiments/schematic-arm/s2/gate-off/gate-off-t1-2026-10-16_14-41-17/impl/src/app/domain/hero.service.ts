import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './example-roster';
import type { Hero } from './hero';

/** Every field a caller may change. The id is the lookup key, never edited. */
export type HeroChanges = Partial<Omit<Hero, 'id'>>;

/** A recruit's intake fields. The service assigns the id and starts the record on Reserve with no missions. */
export type NewHero = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearance' | 'notes'>;

/**
 * In-memory roster. There is no backend: the list is seeded from EXAMPLE_ROSTER
 * (example data) and lives only as long as the page. Edits made through these
 * methods are not persisted across a reload.
 */
@Service()
export class HeroService {
  private readonly roster = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The whole roster. Read it inside a computed or template to track changes. */
  readonly heroes = this.roster.asReadonly();

  /** The hero with this id, or undefined when none matches. */
  byId(id: string): Hero | undefined {
    return this.roster().find((hero) => hero.id === id);
  }

  /** Replace the listed fields of one hero. Unknown ids are a no-op. */
  update(id: string, changes: HeroChanges): void {
    this.roster.update((heroes) => heroes.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)));
  }

  /** Add a recruit under the next free id and return the new record. */
  add(fields: NewHero): Hero {
    const hero: Hero = { ...fields, id: this.nextId(), status: 'Reserve', missionCount: 0, successRate: 0 };
    this.roster.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /**
   * Log one mission for an Active hero. Returns the new mission count, or undefined
   * when the hero is missing or not Active (only an Active hero can deploy).
   */
  deploy(id: string): number | undefined {
    const hero = this.byId(id);
    if (hero?.status !== 'Active') {
      return undefined;
    }
    const missionCount = hero.missionCount + 1;
    this.update(id, { missionCount });
    return missionCount;
  }

  /** Remove one hero from the roster. Unknown ids are a no-op. */
  retire(id: string): void {
    this.roster.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  /** Discard every edit and put the example roster back. */
  reset(): void {
    this.roster.set(EXAMPLE_ROSTER);
  }

  /** One past the highest numbered id, zero-padded to match the example roster ("HRO-0082"). */
  private nextId(): string {
    const highest = Math.max(0, ...this.roster().map((hero) => Number(hero.id.replace(/\D/g, ''))));
    return `HRO-${String(highest + 1).padStart(4, '0')}`;
  }
}
