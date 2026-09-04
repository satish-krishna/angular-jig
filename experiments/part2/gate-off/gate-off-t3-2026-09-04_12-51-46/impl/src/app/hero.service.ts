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
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Wonder Woman' },
    { id: 4, name: 'Flash' },
    { id: 5, name: 'Green Lantern' },
    { id: 6, name: 'Aquaman' },
    { id: 7, name: 'Martian Manhunter' },
    { id: 8, name: 'Black Widow' },
    { id: 9, name: 'Iron Man' },
    { id: 10, name: 'Thor' },
    { id: 11, name: 'Spider-Man' },
    { id: 12, name: 'Captain America' },
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
