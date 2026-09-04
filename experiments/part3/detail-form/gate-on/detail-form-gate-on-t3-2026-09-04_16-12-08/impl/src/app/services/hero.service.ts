import { Injectable } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroes: Hero[] = [
    { id: 1, name: 'Dr. Nice' },
    { id: 2, name: 'Narco' },
    { id: 3, name: 'Bombasto' },
    { id: 4, name: 'Celeritas' },
    { id: 5, name: 'Magneta' },
    { id: 6, name: 'RubberMan' },
    { id: 7, name: 'Good Graph' },
    { id: 8, name: 'Photon' },
    { id: 9, name: 'Dynama' },
    { id: 10, name: 'Dr. IQ' },
    { id: 11, name: 'Magma' },
    { id: 12, name: 'Tornado' },
  ];

  getHero(id: number): Hero | undefined {
    return this.heroes.find((hero) => hero.id === id);
  }

  updateHero(id: number, updatedHero: Partial<Hero>): void {
    const hero = this.heroes.find((h) => h.id === id);
    if (hero) {
      Object.assign(hero, updatedHero);
    }
  }

  getHeroes(): Hero[] {
    return this.heroes;
  }
}
