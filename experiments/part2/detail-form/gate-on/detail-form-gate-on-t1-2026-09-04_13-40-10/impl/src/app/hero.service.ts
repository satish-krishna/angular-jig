import { Injectable, signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private heroes = signal<Hero[]>([
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Wonder Woman' },
    { id: 4, name: 'The Flash' },
    { id: 5, name: 'Aquaman' },
    { id: 6, name: 'Green Lantern' },
    { id: 7, name: 'Hawkeye' },
    { id: 8, name: 'Iron Man' },
    { id: 9, name: 'Captain America' },
    { id: 10, name: 'Thor' },
    { id: 11, name: 'Black Widow' },
    { id: 12, name: 'Hulk' },
  ]);

  getHero(id: number): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(hero: Hero): void {
    this.heroes.update((heroes) =>
      heroes.map((h) => (h.id === hero.id ? { ...hero } : h))
    );
  }

  getAllHeroes(): Hero[] {
    return this.heroes();
  }
}
