import { Service, signal } from '@angular/core';
import type { Hero, HeroDraft } from './hero.model';
import { EXAMPLE_HEROES } from './hero.seed';

/**
 * In-memory roster. EXAMPLE DATA ONLY: there is no backend, so every change lives in
 * signal state and is lost on reload. Routed screens read it through their ViewModels.
 */
@Service()
export class HeroService {
  private readonly state = signal<readonly Hero[]>(EXAMPLE_HEROES);

  readonly heroes = this.state.asReadonly();

  findById(id: string): Hero | undefined {
    return this.state().find((hero) => hero.id === id);
  }

  /** Applies a partial update to one hero. The id is fixed and cannot be patched. */
  update(id: string, patch: Partial<Omit<Hero, 'id'>>): Hero | undefined {
    const current = this.findById(id);
    if (!current) {
      return undefined;
    }
    const next: Hero = { ...current, ...patch };
    this.state.update((heroes) => heroes.map((hero) => (hero.id === id ? next : hero)));
    return next;
  }

  /** Adds an Active hero with the next free roster id and an empty record. */
  recruit(draft: HeroDraft): Hero {
    const highest = Math.max(0, ...this.state().map((hero) => Number(hero.id.slice('HRO-'.length))));
    const hero: Hero = {
      ...draft,
      id: `HRO-${String(highest + 1).padStart(4, '0')}`,
      status: 'Active',
      missionCount: 0,
      successRate: 0,
    };
    this.state.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /** Removes a hero from the roster. The change lasts until the page reloads, like every other change here. */
  retire(id: string): void {
    this.state.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  /** Puts the example roster back. */
  reset(): void {
    this.state.set(EXAMPLE_HEROES);
  }
}
