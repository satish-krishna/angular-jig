import { Injectable } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private heroes: Hero[] = [
    { id: 1, name: 'Dr. Nice' },
    { id: 2, name: 'Narco' },
    { id: 3, name: 'Windstorm' },
    { id: 4, name: 'Bombasto' },
    { id: 5, name: 'Celeritas' },
    { id: 6, name: 'Magneta' },
    { id: 7, name: 'RubberMan' },
    { id: 8, name: 'Dynama' },
    { id: 9, name: 'Dr. IQ' },
    { id: 10, name: 'Magma' },
    { id: 11, name: 'Tornado' },
    { id: 12, name: 'Mr. Amazing' },
  ];

  getHeroes(): Hero[] {
    return this.heroes;
  }

  getTopHeroes(limit: number = 4): Hero[] {
    return this.heroes.slice(0, limit);
  }

  searchHeroes(query: string): Hero[] {
    if (!query.trim()) {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return this.heroes.filter((hero) =>
      hero.name.toLowerCase().includes(lowerQuery)
    );
  }

  getHero(id: number): Hero | undefined {
    return this.heroes.find((hero) => hero.id === id);
  }
}
