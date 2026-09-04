import { Injectable, signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroes = signal<Hero[]>([
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Wonder Woman' },
    { id: 4, name: 'The Flash' },
    { id: 5, name: 'Green Lantern' },
    { id: 6, name: 'Aquaman' },
    { id: 7, name: 'Spider-Man' },
    { id: 8, name: 'Iron Man' },
    { id: 9, name: 'Thor' },
    { id: 10, name: 'Captain America' },
    { id: 11, name: 'Black Widow' },
    { id: 12, name: 'Hulk' },
  ]);

  getHero(id: number): Hero | undefined {
    return this.heroes().find(h => h.id === id);
  }

  updateHero(hero: Hero): void {
    const heroes = this.heroes();
    const index = heroes.findIndex(h => h.id === hero.id);
    if (index !== -1) {
      this.heroes.update(h => [
        ...h.slice(0, index),
        hero,
        ...h.slice(index + 1),
      ]);
    }
  }

  getHeroes(): Hero[] {
    return this.heroes();
  }
}
