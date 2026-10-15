import { Service, computed, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './hero.example-data';
import type { Hero } from './hero.model';

/** The fields a new recruit is filed with. The service assigns the id, status and mission record. */
export type HeroDraft = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearance' | 'notes'>;

/**
 * In-memory hero store. Holds EXAMPLE DATA (see `hero.example-data.ts`) as signal
 * state; there is no backend, so updates last only until the page reloads.
 */
@Service()
export class HeroService {
  private readonly heroes = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** Next id to assign to a recruit. Starts past the highest seeded id and only counts up, so a retired id is never reused. */
  private nextSerial = Math.max(...EXAMPLE_ROSTER.map((hero) => Number(hero.id.slice(4)))) + 1;

  /** The full roster, read-only. */
  readonly list = this.heroes.asReadonly();
  readonly count = computed(() => this.heroes().length);

  /** Files a new recruit on the roster. New recruits start in Reserve with no missions on record. */
  add(draft: HeroDraft): Hero {
    const id = `HRO-${String(this.nextSerial++).padStart(4, '0')}`;
    const hero: Hero = { ...draft, id, status: 'Reserve', missions: 0, successRate: 0 };
    this.heroes.update((list) => [...list, hero]);
    return hero;
  }

  /** Looks up a hero by id. Reads the signal, so calling it inside a `computed` stays reactive. */
  byId(id: string): Hero | undefined {
    return this.heroes().find((hero) => hero.id === id);
  }

  /**
   * Applies a partial update to the hero with `id` and returns the stored record,
   * or `undefined` if no hero has that id. The id itself cannot be changed.
   */
  update(id: string, patch: Partial<Omit<Hero, 'id'>>): Hero | undefined {
    const current = this.byId(id);
    if (!current) {
      return undefined;
    }
    const next: Hero = { ...current, ...patch };
    this.heroes.update((list) => list.map((hero) => (hero.id === id ? next : hero)));
    return next;
  }

  /**
   * Deploys the hero with `id` on a mission: one more mission on record. Only an Active hero
   * can deploy. Returns the stored record, or `undefined` if the hero is missing or not Active.
   */
  deploy(id: string): Hero | undefined {
    const hero = this.byId(id);
    if (hero?.status !== 'Active') {
      return undefined;
    }
    return this.update(id, { missions: hero.missions + 1 });
  }

  /** Removes the hero with `id` from the roster. Returns `false` if no hero has that id. */
  retire(id: string): boolean {
    if (!this.byId(id)) {
      return false;
    }
    this.heroes.update((list) => list.filter((hero) => hero.id !== id));
    return true;
  }
}
