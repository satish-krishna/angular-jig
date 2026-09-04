import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeroesService {
  private heroes = signal<Hero[]>([
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Wonder Woman' },
    { id: 4, name: 'Flash' },
    { id: 5, name: 'Green Lantern' },
    { id: 6, name: 'Aquaman' },
    { id: 7, name: 'Cyborg' },
    { id: 8, name: 'Hawkman' },
    { id: 9, name: 'Black Widow' },
    { id: 10, name: 'Iron Man' },
    { id: 11, name: 'Captain America' },
    { id: 12, name: 'Thor' },
  ]);

  getHeroes() {
    return this.heroes();
  }

  getHero(id: number) {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(id: number, name: string) {
    this.heroes.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, name } : h))
    );
  }
}
