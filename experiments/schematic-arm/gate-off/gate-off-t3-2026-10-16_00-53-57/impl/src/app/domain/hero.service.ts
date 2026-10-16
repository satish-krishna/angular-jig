import { Injectable, signal } from '@angular/core';
import { EXAMPLE_HEROES } from './hero.data';
import type { Hero } from './hero';

/**
 * In-memory hero store. There is no backend: state is seeded from EXAMPLE_HEROES
 * (example data) and resets on reload. Reads and writes go through signals, so a
 * ViewModel that calls `byId` inside a `computed` stays current after `update`.
 */
@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly state = signal<readonly Hero[]>(EXAMPLE_HEROES);

  readonly heroes = this.state.asReadonly();

  byId(id: string): Hero | undefined {
    return this.state().find((hero) => hero.id === id);
  }

  /** Merges `changes` into the hero with `id`. Returns the updated hero, or undefined if none matches. */
  update(id: string, changes: Partial<Omit<Hero, 'id'>>): Hero | undefined {
    const current = this.byId(id);
    if (!current) {
      return undefined;
    }
    const next: Hero = { ...current, ...changes };
    this.state.update((heroes) => heroes.map((hero) => (hero.id === id ? next : hero)));
    return next;
  }

  /** Adds a recruit to the roster under the next free ID. Returns the stored record. */
  add(draft: Omit<Hero, 'id'>): Hero {
    const next: Hero = { id: this.nextId(), ...draft };
    this.state.update((heroes) => [...heroes, next]);
    return next;
  }

  /** Removes the hero with `id` from the roster. Returns true if a hero was removed. */
  remove(id: string): boolean {
    if (!this.byId(id)) {
      return false;
    }
    this.state.update((heroes) => heroes.filter((hero) => hero.id !== id));
    return true;
  }

  private nextId(): string {
    const highest = this.state().reduce((max, hero) => Math.max(max, Number(hero.id.replace(/\D/g, ''))), 0);
    return `HRO-${String(highest + 1).padStart(4, '0')}`;
  }
}
