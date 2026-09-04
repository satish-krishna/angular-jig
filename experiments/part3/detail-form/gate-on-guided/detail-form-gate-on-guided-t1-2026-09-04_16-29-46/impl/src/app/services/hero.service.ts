import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroes = signal<Hero[]>([
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Wonder Woman' },
    { id: 4, name: 'Spider-Man' },
    { id: 5, name: 'Iron Man' },
    { id: 6, name: 'Black Widow' },
    { id: 7, name: 'Captain America' },
    { id: 8, name: 'Thor' },
    { id: 9, name: 'Hulk' },
    { id: 10, name: 'Black Panther' },
    { id: 11, name: 'Doctor Strange' },
    { id: 12, name: 'Ant-Man' },
  ]);

  getHero(id: number): Hero | undefined {
    return this.heroes().find(h => h.id === id);
  }

  updateHero(id: number, name: string): void {
    this.heroes.update(heroes =>
      heroes.map(h => h.id === id ? { ...h, name } : h)
    );
  }

  getHeroes(): Hero[] {
    return this.heroes();
  }
}
