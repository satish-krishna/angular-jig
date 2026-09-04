import { Injectable } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private readonly heroes: Hero[] = [
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
    { id: 21, name: 'Mr. Incredible' },
    { id: 22, name: 'Phantom Lad' },
  ];

  getHeroes(): Hero[] {
    return this.heroes;
  }

  getTopHeroes(count: number = 4): Hero[] {
    return this.heroes.slice(0, count);
  }

  searchHeroes(term: string): Hero[] {
    if (!term.trim()) {
      return [];
    }
    return this.heroes.filter((hero) =>
      hero.name.toLowerCase().includes(term.toLowerCase())
    );
  }
}
