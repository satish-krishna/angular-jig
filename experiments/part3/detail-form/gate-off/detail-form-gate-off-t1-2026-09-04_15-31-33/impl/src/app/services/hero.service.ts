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
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
    { id: 3, name: 'Wonder Woman' },
    { id: 4, name: 'The Flash' },
    { id: 5, name: 'Green Lantern' },
    { id: 6, name: 'Aquaman' },
    { id: 7, name: 'Cyborg' },
    { id: 8, name: 'Hawkgirl' },
    { id: 9, name: 'Black Canary' },
    { id: 10, name: 'Green Arrow' },
    { id: 11, name: 'Martian Manhunter' },
    { id: 12, name: 'Zatanna' },
  ]);

  getHero(id: number): Hero | undefined {
    return this.heroesSignal().find((h) => h.id === id);
  }

  updateHero(id: number, name: string): void {
    this.heroesSignal.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, name } : h))
    );
  }

  getAllHeroes(): Hero[] {
    return this.heroesSignal();
  }
}
