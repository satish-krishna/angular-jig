import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
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
    { id: 11, name: 'Phantom Lancer' },
    { id: 12, name: 'Captain Planet' },
  ]);

  getHeroById(id: number): Hero | undefined {
    return this.heroes().find((hero) => hero.id === id);
  }

  updateHero(id: number, updatedData: Partial<Hero>): void {
    this.heroes.update((heroes) =>
      heroes.map((hero) => (hero.id === id ? { ...hero, ...updatedData } : hero))
    );
  }
}
