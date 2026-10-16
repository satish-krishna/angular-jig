import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './hero.example-data';
import type { Hero } from './hero.model';

/** The fields a caller may change. The id is fixed once a hero exists. */
export type HeroChanges = Partial<Omit<Hero, 'id'>>;

/** The fields a recruit supplies. The id, status and record start fresh. */
export type HeroDraft = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearance'>;

/**
 * The hero roster, held as in-memory signal state. EXAMPLE DATA: there is no
 * backend, so every change lives only until the page reloads.
 */
@Service()
export class HeroService {
  private readonly state = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The full roster, read-only to callers. */
  readonly heroes = this.state.asReadonly();

  /** Look up one hero by id. Undefined when no hero carries that id. */
  find(id: string): Hero | undefined {
    return this.state().find((hero) => hero.id === id);
  }

  /**
   * Apply changes to one hero and return the updated record. Undefined when
   * no hero carries that id, in which case the roster is left untouched.
   */
  update(id: string, changes: HeroChanges): Hero | undefined {
    const current = this.find(id);
    if (!current) {
      return undefined;
    }
    const next: Hero = { ...current, ...changes };
    this.state.update((heroes) => heroes.map((hero) => (hero.id === id ? next : hero)));
    return next;
  }

  /** Add a recruit to the roster and return the new record. Recruits start in Reserve with no missions. */
  create(draft: HeroDraft): Hero {
    const hero: Hero = { ...draft, id: this.nextId(), status: 'Reserve', missionCount: 0, successRate: 0 };
    this.state.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /** Take one hero off the roster. False when no hero carries that id. */
  remove(id: string): boolean {
    if (!this.find(id)) {
      return false;
    }
    this.state.update((heroes) => heroes.filter((hero) => hero.id !== id));
    return true;
  }

  /** The next free id after the highest existing HRO-nnnn number. */
  private nextId(): string {
    const highest = this.state().reduce((max, hero) => Math.max(max, Number(hero.id.replace(/^HRO-/, '')) || 0), 0);
    return `HRO-${String(highest + 1).padStart(4, '0')}`;
  }
}
