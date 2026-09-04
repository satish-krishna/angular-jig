import { Injectable } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

const HEROES: Hero[] = [
  { id: 1, name: 'Superman' },
  { id: 2, name: 'Batman' },
  { id: 3, name: 'Wonder Woman' },
  { id: 4, name: 'Flash' },
  { id: 5, name: 'Aquaman' },
  { id: 6, name: 'Green Lantern' },
  { id: 7, name: 'Hawkman' },
  { id: 8, name: 'Cyborg' },
  { id: 9, name: 'Martian Manhunter' },
  { id: 10, name: 'Green Arrow' },
  { id: 11, name: 'Black Widow' },
  { id: 12, name: 'Hawkeye' },
];

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  getHeroes() {
    return HEROES;
  }

  getHero(id: number): Hero | undefined {
    return HEROES.find(h => h.id === id);
  }
}
