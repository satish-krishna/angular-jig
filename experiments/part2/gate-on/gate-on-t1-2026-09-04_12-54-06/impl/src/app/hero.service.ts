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
    { id: 11, name: 'Dr. Nice' },
    { id: 12, name: 'Narco' },
    { id: 13, name: 'Bombasto' },
    { id: 14, name: 'Celeritas' },
    { id: 15, name: 'Magneta' },
    { id: 16, name: 'RubberMan' },
    { id: 17, name: 'Dynama' },
    { id: 18, name: 'Dr. IQ' },
    { id: 19, name: 'Magma' },
    { id: 20, name: 'Tornado' },
    { id: 21, name: 'Captain Planet' },
    { id: 22, name: 'Iron Fist' },
  ];

  getHeroes(): Hero[] {
    return this.heroes;
  }

  getHero(id: number): Hero | undefined {
    return this.heroes.find((hero) => hero.id === id);
  }

  getTopHeroes(count: number = 4): Hero[] {
    return this.heroes.slice(0, count);
  }

  searchHeroes(query: string): Hero[] {
    if (!query.trim()) {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return this.heroes.filter((hero) => hero.name.toLowerCase().includes(lowerQuery));
  }
}
