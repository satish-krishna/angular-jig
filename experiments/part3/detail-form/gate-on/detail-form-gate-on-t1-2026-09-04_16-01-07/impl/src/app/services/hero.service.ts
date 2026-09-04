import { Injectable, signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroes = signal<Hero[]>([
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
    { id: 11, name: 'Mr. Fantastic' },
    { id: 12, name: 'Captain Amazing' },
  ]);

  getHero(id: number): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(id: number, name: string): void {
    this.heroes.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, name } : h))
    );
  }

  getAllHeroes(): Hero[] {
    return this.heroes();
  }
}
