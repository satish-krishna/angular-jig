import { Injectable, signal, computed } from '@angular/core';
import { Hero } from './hero.model';

/**
 * Example in-memory hero roster. This is hardcoded example data.
 * There is no backend; all operations are local to this service.
 */
const EXAMPLE_HEROES: Hero[] = [
  {
    id: '1',
    name: 'Silverwing',
    alias: 'Swift Guardian',
    powerClass: 'Aerial',
    powerIndex: 92,
    status: 'Active',
    clearanceTier: 'Tier4',
    missionCount: 47,
    successRate: 98,
  },
  {
    id: '2',
    name: 'Dr. Ion',
    alias: 'The Atomic',
    powerClass: 'Energy',
    powerIndex: 88,
    status: 'Active',
    clearanceTier: 'Tier4',
    missionCount: 41,
    successRate: 95,
  },
  {
    id: '3',
    name: 'Vantablack',
    alias: 'Shadow Dancer',
    powerClass: 'Enhanced',
    powerIndex: 85,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 38,
    successRate: 92,
  },
  {
    id: '4',
    name: 'Aurora Vale',
    alias: 'Light Bringer',
    powerClass: 'Energy',
    powerIndex: 84,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 35,
    successRate: 91,
  },
  {
    id: '5',
    name: 'Magnetar',
    alias: 'The Attraction',
    powerClass: 'Tech',
    powerIndex: 82,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 32,
    successRate: 89,
  },
  {
    id: '6',
    name: 'The Tinkerer',
    alias: 'Gear Master',
    powerClass: 'Tech',
    powerIndex: 79,
    status: 'Injured',
    clearanceTier: 'Tier2',
    missionCount: 28,
    successRate: 87,
  },
  {
    id: '7',
    name: 'Halcyon',
    alias: 'Peace Keeper',
    powerClass: 'Psionic',
    powerIndex: 81,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 39,
    successRate: 93,
  },
  {
    id: '8',
    name: 'Rift',
    alias: 'Portal Walker',
    powerClass: 'Cosmic',
    powerIndex: 87,
    status: 'Active',
    clearanceTier: 'Tier4',
    missionCount: 44,
    successRate: 96,
  },
  {
    id: '9',
    name: 'Ember Cho',
    alias: 'Inferno',
    powerClass: 'Energy',
    powerIndex: 86,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 36,
    successRate: 90,
  },
  {
    id: '10',
    name: 'Null',
    alias: 'The Void',
    powerClass: 'Psionic',
    powerIndex: 83,
    status: 'Reserve',
    clearanceTier: 'Tier2',
    missionCount: 22,
    successRate: 88,
  },
  {
    id: '11',
    name: 'Grond',
    alias: 'The Unmovable',
    powerClass: 'Mutant',
    powerIndex: 80,
    status: 'Active',
    clearanceTier: 'Tier2',
    missionCount: 29,
    successRate: 86,
  },
  {
    id: '12',
    name: 'Ms. Meridian',
    alias: 'Compass',
    powerClass: 'Cosmic',
    powerIndex: 78,
    status: 'Active',
    clearanceTier: 'Tier2',
    missionCount: 25,
    successRate: 85,
  },
];

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly heroesSignal = signal<Hero[]>(EXAMPLE_HEROES);

  readonly heroes = this.heroesSignal.asReadonly();
  readonly heroCount = computed(() => this.heroesSignal().length);

  getHeroById(id: string): Hero | undefined {
    return this.heroesSignal().find((h) => h.id === id);
  }

  updateHero(id: string, updates: Partial<Hero>): void {
    this.heroesSignal.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  }

  addHero(hero: Hero): void {
    this.heroesSignal.update((heroes) => [...heroes, hero]);
  }

  removeHero(id: string): void {
    this.heroesSignal.update((heroes) => heroes.filter((h) => h.id !== id));
  }
}
