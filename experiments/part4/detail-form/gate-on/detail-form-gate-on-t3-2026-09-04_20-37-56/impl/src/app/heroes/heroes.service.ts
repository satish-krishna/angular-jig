import { Injectable } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HeroesService {
  private heroes: Hero[] = [
    { id: 1, name: 'Dr. Nice' },
    { id: 2, name: 'Narco' },
    { id: 3, name: 'Bombasto' },
    { id: 4, name: 'Celeritas' },
    { id: 5, name: 'Magneta' },
    { id: 6, name: 'RubberMan' },
    { id: 7, name: 'Dynama' },
    { id: 8, name: 'Dr. IQ' },
    { id: 9, name: 'Magma' },
    { id: 10, name: 'Tornado' },
    { id: 11, name: 'Cyclone' },
    { id: 12, name: 'Phantom' },
  ];

  getHero(id: number): Hero | undefined {
    return this.heroes.find((hero) => hero.id === id);
  }

  updateHero(hero: Hero): void {
    const index = this.heroes.findIndex((h) => h.id === hero.id);
    if (index > -1) {
      this.heroes[index] = hero;
    }
  }

  getHeroes(): Hero[] {
    return this.heroes;
  }
}
