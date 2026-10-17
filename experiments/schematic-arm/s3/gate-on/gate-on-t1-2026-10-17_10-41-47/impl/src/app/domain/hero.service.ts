import { Service, computed, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './hero.example-roster';
import type { Hero, HeroEdit, HeroStatus, NewHero } from './hero.model';

/**
 * Holds the hero roster as in-memory signal state. There is no backend: the roster
 * is EXAMPLE DATA and resets on every page load. Updates replace the hero record
 * in place, so any computed that reads the roster sees the change.
 */
@Service()
export class HeroService {
  private readonly heroes = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The full roster, in the order it was seeded. */
  readonly roster = this.heroes.asReadonly();

  /** Roster count, for stat tiles and the table footer. */
  readonly count = computed(() => this.heroes().length);

  /** Adds a recruit to the roster under the next free ID, and returns the new record. */
  add(recruit: NewHero): Hero {
    const highest = Math.max(0, ...this.heroes().map((hero) => Number(hero.id.slice('HRO-'.length))));
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

  /** Returns the hero with this id, or undefined if there is none. */
  findById(id: string): Hero | undefined {
    return this.heroes().find((hero) => hero.id === id);
  }

  /**
   * Applies the edit to the hero with this id and returns the updated record, or
   * undefined if no hero has that id. Status, clearance and mission history are
   * not touched here.
   */
  update(id: string, edit: HeroEdit): Hero | undefined {
    let updated: Hero | undefined;
    this.heroes.update((roster) =>
      roster.map((hero) => {
        if (hero.id !== id) return hero;
        updated = { ...hero, ...edit };
        return updated;
      }),
    );
    return updated;
  }

  /** Sets the hero's roster status (Deploy sets Active). Returns the updated record, or undefined if there is no such hero. */
  setStatus(id: string, status: HeroStatus): Hero | undefined {
    let updated: Hero | undefined;
    this.heroes.update((roster) =>
      roster.map((hero) => {
        if (hero.id !== id) return hero;
        updated = { ...hero, status };
        return updated;
      }),
    );
    return updated;
  }

  /** Retires the hero: removes the record from the roster. Returns false if no hero has that id. */
  retire(id: string): boolean {
    if (!this.findById(id)) return false;
    this.heroes.update((roster) => roster.filter((hero) => hero.id !== id));
    return true;
  }
}
