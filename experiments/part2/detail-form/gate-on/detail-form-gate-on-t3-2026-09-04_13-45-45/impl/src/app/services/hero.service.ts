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
    { id: 7, name: 'Hawkman' },
    { id: 8, name: 'Black Widow' },
    { id: 9, name: 'Iron Man' },
    { id: 10, name: 'Captain America' },
    { id: 11, name: 'Thor' },
    { id: 12, name: 'Spider-Man' },
  ]);

  getHeroes() {
    return this.heroes().slice();
  }

  getHero(id: number) {
    return this.heroes().find((hero) => hero.id === id);
  }

  updateHero(id: number, name: string) {
    this.heroes.update((heroes) =>
      heroes.map((hero) => (hero.id === id ? { ...hero, name } : hero))
    );
  }
}
