import { Injectable } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroes: Hero[] = [
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Wonder Woman' },
    { id: 4, name: 'Flash' },
    { id: 5, name: 'Green Lantern' },
    { id: 6, name: 'Aquaman' },
    { id: 7, name: 'Hawkeye' },
    { id: 8, name: 'Black Widow' },
    { id: 9, name: 'Iron Man' },
    { id: 10, name: 'Thor' },
    { id: 11, name: 'Captain America' },
    { id: 12, name: 'Hulk' },
  ];

  getHero(id: number): Hero | undefined {
    return this.heroes.find(h => h.id === id);
  }

  updateHero(id: number, name: string): void {
    const hero = this.heroes.find(h => h.id === id);
    if (hero) {
      hero.name = name;
    }
  }

  getHeroes(): Hero[] {
    return this.heroes;
  }
}
