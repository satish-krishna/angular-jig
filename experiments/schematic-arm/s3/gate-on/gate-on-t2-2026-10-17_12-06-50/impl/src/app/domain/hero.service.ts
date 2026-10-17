import { computed, Injectable, signal } from '@angular/core';
import { EXAMPLE_HEROES } from './hero.example-data';
import type { Hero } from './hero.model';
import type { HeroModel, RecruitModel } from './hero.schema';

/**
 * In-memory hero store. There is no backend: the roster is EXAMPLE DATA seeded from
 * hero.example-data.ts and lives only as long as the page. Updates replace the record
 * in place; nothing is persisted.
 */
@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly _heroes = signal<readonly Hero[]>(EXAMPLE_HEROES);

  public readonly heroes = this._heroes.asReadonly();
  public readonly count = computed(() => this._heroes().length);

  public byId(id: string): Hero | undefined {
    return this._heroes().find((hero) => hero.id === id);
  }

  /** Applies the editable fields to the hero with this id. Returns the updated hero, or undefined if none matches. */
  public update(id: string, changes: HeroModel): Hero | undefined {
    const current = this.byId(id);
    if (!current) return undefined;

    const updated: Hero = { ...current, ...changes };
    this._heroes.update((heroes) => heroes.map((hero) => (hero.id === id ? updated : hero)));
    return updated;
  }

  /** Adds a recruit to the roster in Reserve with no mission record. Returns the new hero. */
  public recruit(model: RecruitModel): Hero {
    const hero: Hero = {
      ...model,
      id: this._uniqueId(model.name),
      status: 'Reserve',
      missionCount: 0,
      successRate: 0,
    };
    this._heroes.update((heroes) => [...heroes, hero]);
    return hero;
  }

  /** Removes the hero with this id from the roster. Returns false if none matches. */
  public retire(id: string): boolean {
    if (!this.byId(id)) return false;

    this._heroes.update((heroes) => heroes.filter((hero) => hero.id !== id));
    return true;
  }

  /** Puts the example roster back, discarding edits, recruits, and retirements. */
  public restore(): void {
    this._heroes.set(EXAMPLE_HEROES);
  }

  // A slug of the name, numbered if it is already taken: "Dr. Ion" becomes "dr-ion", then "dr-ion-2".
  private _uniqueId(name: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'hero';
    let id = base;
    for (let n = 2; this.byId(id); n++) {
      id = `${base}-${n}`;
    }
    return id;
  }
}
