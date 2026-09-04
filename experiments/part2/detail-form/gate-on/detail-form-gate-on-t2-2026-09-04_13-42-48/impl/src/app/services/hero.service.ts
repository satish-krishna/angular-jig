import { Injectable, signal } from '@angular/core';

export interface Hero {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private heroesSignal = signal<Hero[]>([
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
    { id: 12, name: 'Taskmaster' },
  ]);

  getHero(id: number): Hero | undefined {
    return this.heroesSignal().find((hero) => hero.id === id);
  }

  updateHero(id: number, name: string): void {
    this.heroesSignal.update((heroes) =>
      heroes.map((hero) => (hero.id === id ? { ...hero, name } : hero))
    );
  }

  getHeroes(): Hero[] {
    return this.heroesSignal();
  }
}
