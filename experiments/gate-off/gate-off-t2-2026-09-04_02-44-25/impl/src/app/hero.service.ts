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
    { id: 3, name: 'Bombasto' },
    { id: 4, name: 'Celeritas' },
    { id: 5, name: 'Magneta' },
    { id: 6, name: 'RubberMan' },
    { id: 7, name: 'Dynama' },
    { id: 8, name: 'Dr. IQ' },
    { id: 9, name: 'Magma' },
    { id: 10, name: 'Tornado' },
    { id: 11, name: 'Nightcrawler' },
    { id: 12, name: 'Captain Planet' },
  ];

  getHeroes(): Hero[] {
    return this.heroes;
  }

  getHero(id: number): Hero | undefined {
    return this.heroes.find((h) => h.id === id);
  }

  getTopHeroes(count: number = 4): Hero[] {
    return this.heroes.slice(0, count);
  }

  searchHeroes(query: string): Hero[] {
    if (!query.trim()) {
      return [];
    }
    return this.heroes.filter((h) =>
      h.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
