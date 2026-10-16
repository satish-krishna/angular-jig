import { Service, signal } from '@angular/core';
import { EXAMPLE_ROSTER } from './example-roster';
import type { Hero } from './hero.model';

/** What a recruit supplies. The service assigns the id and starts the record with no missions. */
export type RecruitDraft = Pick<Hero, 'name' | 'alias' | 'powerClass' | 'powerIndex' | 'clearance'>;

/**
 * The hero roster as in-memory signal state. There is no backend: the roster is
 * EXAMPLE DATA seeded from `example-roster.ts`, and edits last until the page reloads.
 */
@Service()
export class HeroService {
  private readonly roster = signal<readonly Hero[]>(EXAMPLE_ROSTER);

  /** The whole roster. Read-only to consumers; change it through `update`, `retire`, `recruit`, or `reset`. */
  readonly heroes = this.roster.asReadonly();

  /** Look up one hero by id. Returns `undefined` when no hero has that id. */
  byId(id: string): Hero | undefined {
    return this.roster().find((hero) => hero.id === id);
  }

  /**
   * Add a recruit to the roster. The recruit starts Active with no missions on record,
   * so it can be deployed at once. Returns the new hero.
   */
  recruit(draft: RecruitDraft): Hero {
    const hero: Hero = { ...draft, id: this.nextId(), status: 'Active', missions: 0, successRate: 0 };
    this.roster.update((list) => [...list, hero]);
    return hero;
  }

  /** Restore the example roster. Used by Settings to undo edits, retirements, and recruits. */
  reset(): void {
    this.roster.set(EXAMPLE_ROSTER);
  }

  /**
   * Apply a partial change to one hero. Returns the updated hero, or `undefined`
   * when no hero has that id. The id itself cannot be changed.
   */
  update(id: string, changes: Partial<Omit<Hero, 'id'>>): Hero | undefined {
    const current = this.byId(id);
    if (!current) {
      return undefined;
    }
    const updated: Hero = { ...current, ...changes };
    this.roster.update((list) => list.map((hero) => (hero.id === id ? updated : hero)));
    return updated;
  }

  /**
   * Retire a hero: take them off the roster. Returns the retired hero, or `undefined`
   * when no hero has that id.
   */
  retire(id: string): Hero | undefined {
    const current = this.byId(id);
    if (!current) {
      return undefined;
    }
    this.roster.update((list) => list.filter((hero) => hero.id !== id));
    return current;
  }

  /** The next free id: one past the highest existing `HRO-nnnn` number. */
  private nextId(): string {
    const highest = this.roster().reduce((max, hero) => Math.max(max, Number(hero.id.slice(4))), 0);
    return `HRO-${String(highest + 1).padStart(4, '0')}`;
  }
}
