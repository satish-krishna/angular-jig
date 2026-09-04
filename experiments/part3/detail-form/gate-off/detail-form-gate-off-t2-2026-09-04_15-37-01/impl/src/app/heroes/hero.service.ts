import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroes = signal<Hero[]>([
    { id: 1, name: 'Mr. Nice' },
    { id: 2, name: 'Narco' },
    { id: 3, name: 'Windstorm' },
    { id: 4, name: 'Bombasto' },
    { id: 5, name: 'Celeritas' },
    { id: 6, name: 'Magneta' },
    { id: 7, name: 'RubberMan' },
    { id: 8, name: 'Dynama' },
    { id: 9, name: 'Dr IQ' },
    { id: 10, name: 'Magma' },
    { id: 11, name: 'Tornado' },
    { id: 12, name: 'Dr. Quantum' },
  ]);

  getHero(id: number): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(id: number, name: string): void {
    this.heroes.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, name } : h))
    );
  }
}
