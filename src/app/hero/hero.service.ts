import { Injectable, signal } from '@angular/core';
import type { Hero } from './hero.model';
import type { HeroFormModel } from './hero.schema';
import { EXAMPLE_HEROES } from './hero-example-data';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly _heroes = signal<Hero[]>(EXAMPLE_HEROES);
  private readonly _nextId = signal(
    Math.max(...EXAMPLE_HEROES.map((h) => parseInt(h.id, 10))) + 1
  );

  readonly heroes = this._heroes.asReadonly();

  byId(id: string): Hero | undefined {
    return this._heroes().find((h) => h.id === id);
  }

  update(id: string, patch: Partial<HeroFormModel>): void {
    this._heroes.update((list) =>
      list.map((h) =>
        h.id === id
          ? {
              ...h,
              name: patch.name ?? h.name,
              alias: patch.alias ?? h.alias,
              powerClass: patch.powerClass ?? h.powerClass,
              power: patch.power ?? h.power,
              bio: patch.bio ?? h.bio,
            }
          : h
      )
    );
  }

  create(candidate: HeroFormModel): Hero {
    const hero: Hero = {
      id: String(this._nextId()),
      name: candidate.name,
      alias: candidate.alias,
      powerClass: candidate.powerClass,
      power: candidate.power,
      bio: candidate.bio ?? '',
      status: 'Active',
      clearanceTier: 'Tier4',
      missionsRun: 0,
      successRate: 0,
      threatsFaced: 0,
    };
    this._heroes.update((list) => [...list, hero]);
    this._nextId.update((n) => n + 1);
    return hero;
  }

  retire(id: string): void {
    this._heroes.update((list) =>
      list.filter((h) => h.id !== id)
    );
  }
}
