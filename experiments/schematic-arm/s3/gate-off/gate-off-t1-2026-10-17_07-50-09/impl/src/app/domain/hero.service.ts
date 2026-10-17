import { Service, Signal, computed, signal } from '@angular/core';
import { EXAMPLE_HEROES } from './example-heroes';
import { canDeploy, type Hero } from './hero.model';

/** The fields a recruit supplies. Status and mission figures start from a clean record. */
export type NewHero = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearance' | 'notes'>;

// Example IDs run to HRO-0081, so new recruits continue from a clear gap.
const FIRST_NEW_SEQUENCE = 100;

/**
 * In-memory hero store. EXAMPLE DATA ONLY: state is seeded from `EXAMPLE_HEROES`
 * and lives for the page session. There is no backend; updates are not persisted.
 *
 * This is the one copy of the roster. Every screen reads it through its ViewModel,
 * so an edit, a deployment, a recruit or a retirement shows up everywhere at once.
 */
@Service()
export class HeroService {
  private readonly heroes = signal<readonly Hero[]>(EXAMPLE_HEROES);
  private nextSequence = FIRST_NEW_SEQUENCE;

  readonly list = this.heroes.asReadonly();

  byId(id: string): Signal<Hero | undefined> {
    return computed(() => this.heroes().find((hero) => hero.id === id));
  }

  /** Adds a recruit to the roster in Reserve, with no missions on record. */
  add(recruit: NewHero): Hero {
    const hero: Hero = {
      ...recruit,
      id: `HRO-${String(this.nextSequence++).padStart(4, '0')}`,
      status: 'Reserve',
      missionCount: 0,
      successRate: 0,
    };
    this.heroes.update((list) => [...list, hero]);
    return hero;
  }

  /** Takes the hero off the roster for good. */
  retire(id: string): void {
    this.heroes.update((list) => list.filter((hero) => hero.id !== id));
  }

  /** Sends an available hero out on a mission. Returns undefined when the hero cannot go. */
  deploy(id: string): Hero | undefined {
    const current = this.heroes().find((hero) => hero.id === id);
    if (!current || !canDeploy(current.status)) return undefined;
    return this.update(id, { status: 'Active', missionCount: current.missionCount + 1 });
  }

  update(id: string, changes: Partial<Omit<Hero, 'id'>>): Hero | undefined {
    const current = this.heroes().find((hero) => hero.id === id);
    if (!current) return undefined;
    const updated: Hero = { ...current, ...changes };
    this.heroes.update((list) => list.map((hero) => (hero.id === id ? updated : hero)));
    return updated;
  }

  /** Puts the example roster back as it was seeded. */
  reset(): void {
    this.heroes.set(EXAMPLE_HEROES);
    this.nextSequence = FIRST_NEW_SEQUENCE;
  }
}
