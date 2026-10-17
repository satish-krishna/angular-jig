import { Service, signal } from '@angular/core';
import { EXAMPLE_HEROES } from './hero.example-data';
import type { Hero, HeroChanges, HeroDraft } from './hero.model';
import { nextId } from './next-id';

// In-memory store over example data. There is no backend: edits last until reload.
@Service()
export class HeroService {
  private readonly _heroes = signal<readonly Hero[]>(EXAMPLE_HEROES);

  readonly heroes = this._heroes.asReadonly();

  byId(id: string): Hero | undefined {
    return this._heroes().find((hero) => hero.id === id);
  }

  // A recruit starts in reserve with an empty record; a deployment moves them to active.
  add(draft: HeroDraft): Hero {
    const hero: Hero = {
      ...draft,
      id: nextId('HRO', this._heroes().map((existing) => existing.id)),
      status: 'Reserve',
      missions: 0,
      successRate: 0,
    };
    this._heroes.update((heroes) => [...heroes, hero]);
    return hero;
  }

  update(id: string, changes: HeroChanges): void {
    this._heroes.update((heroes) => heroes.map((hero) => (hero.id === id ? { ...hero, ...changes } : hero)));
  }

  // Folds one settled mission into the record. The rate is stored as a percentage, so the
  // wins so far are rebuilt from it before the new result is counted.
  recordMission(id: string, success: boolean): void {
    this._heroes.update((heroes) =>
      heroes.map((hero) => {
        if (hero.id !== id) {
          return hero;
        }
        const missions = hero.missions + 1;
        const wins = Math.round((hero.successRate * hero.missions) / 100) + (success ? 1 : 0);
        return { ...hero, missions, successRate: Math.round((wins / missions) * 100) };
      }),
    );
  }

  // Retiring takes the hero off the roster; there is no retired status in the model.
  retire(id: string): void {
    this._heroes.update((heroes) => heroes.filter((hero) => hero.id !== id));
  }

  reset(): void {
    this._heroes.set(EXAMPLE_HEROES);
  }
}
