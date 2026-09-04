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
    { id: 1, name: 'Captain America' },
    { id: 2, name: 'Iron Man' },
    { id: 3, name: 'Thor' },
    { id: 4, name: 'Black Widow' },
    { id: 5, name: 'Hawkeye' },
    { id: 6, name: 'Hulk' },
    { id: 7, name: 'Spider-Man' },
    { id: 8, name: 'Doctor Strange' },
    { id: 9, name: 'Black Panther' },
    { id: 10, name: 'Captain Marvel' },
    { id: 11, name: 'Scarlet Witch' },
    { id: 12, name: 'Vision' },
  ]);

  getHeroes() {
    return this.heroes();
  }

  getHeroById(id: number): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(id: number, name: string): void {
    const heroes = this.heroes();
    const index = heroes.findIndex((h) => h.id === id);
    if (index !== -1) {
      const updated = [...heroes];
      updated[index] = { ...updated[index], name };
      this.heroes.set(updated);
    }
  }
}
