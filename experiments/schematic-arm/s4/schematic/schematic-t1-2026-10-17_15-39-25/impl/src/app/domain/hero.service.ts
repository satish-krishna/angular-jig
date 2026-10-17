import { Injectable, signal } from '@angular/core';
import type { Hero } from './hero.model';
import type { HeroModel } from './hero.schema';
import { EXAMPLE_HEROES } from './hero-example-data';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly _heroes = signal<Hero[]>(EXAMPLE_HEROES);
  private readonly _nextId = signal(
    Math.max(0, ...EXAMPLE_HEROES.map((item) => parseInt(item.id, 10))) + 1,
  );

  readonly heroes = this._heroes.asReadonly();

  byId(id: string): Hero | undefined {
    return this._heroes().find((item) => item.id === id);
  }

  create(candidate: HeroModel): Hero {
    const hero: Hero = {
      id: String(this._nextId()),
      joined: '2026-10-17',
      missions: 0,
      successRate: 0,
      ...candidate,
    };
    this._heroes.update((items) => [...items, hero]);
    this._nextId.update((n) => n + 1);
    return hero;
  }

  update(id: string, patch: Partial<HeroModel>): void {
    this._heroes.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  remove(id: string): void {
    this._heroes.update((items) => items.filter((item) => item.id !== id));
  }
}
