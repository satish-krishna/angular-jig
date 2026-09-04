import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

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
    { id: 5, name: 'Green Lantern' },
    { id: 6, name: 'Aquaman' },
    { id: 7, name: 'Hawkeye' },
    { id: 8, name: 'Black Widow' },
    { id: 9, name: 'Iron Man' },
    { id: 10, name: 'Captain America' },
    { id: 11, name: 'Thor' },
    { id: 12, name: 'Hulk' },
  ]);

  getHeroes(): Hero[] {
    return this.heroes();
  }

  getHero(id: number): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(id: number, name: string): void {
    this.heroes.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, name } : h))
    );
  }
}
