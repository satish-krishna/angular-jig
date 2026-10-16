import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './example-roster';
import type { Hero } from './hero';

/** The fields a caller may change on an existing hero. The id never changes. */
export type HeroChanges = Partial<Omit<Hero, 'id'>>;

/** What a recruit supplies. The service starts the record: Active, with no missions yet. */
export type HeroDraft = Omit<Hero, 'id' | 'status' | 'missionCount' | 'successRate'>;

/**
 * In-memory roster backed by signals. EXAMPLE DATA: there is no backend, so
 * changes last only until the page reloads.
 */
@Service()
export class HeroService {
  private readonly roster = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The full roster, read-only to callers. Change it through update(), recruit() or retire(). */
  readonly heroes = this.roster.asReadonly();

  /** Looks a hero up by id. Reactive when called inside a computed(). */
  byId(id: string): Hero | undefined {
    return this.roster().find((hero) => hero.id === id);
  }

  /** Applies a partial change to the hero with this id. Unknown ids are a no-op. */
  update(id: string, changes: HeroChanges): void {
    this.roster.update((heroes) =>
      heroes.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)),
    );
  }

  /** Adds a new Active hero to the roster and returns it, with its new id. */
  recruit(draft: HeroDraft): Hero {
    const hero: Hero = { ...draft, id: this.nextId(), status: 'Active', missionCount: 0, successRate: 0 };
    this.roster.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /** Takes the hero off the roster. The example data has no archive, so this is final until reload. */
  retire(id: string): void {
    this.roster.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  /** The next free roster id, one above the highest numbered id on the roster. */
  private nextId(): string {
    const highest = this.roster().reduce((max, hero) => Math.max(max, Number(hero.id.slice(4)) || 0), 0);
    return `HRO-${String(highest + 1).padStart(4, '0')}`;
  }
}
