import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import type { Hero } from './hero';

/**
 * HeroService holds the example roster as in-memory signal state.
 * There is no backend. This is example data.
 */
@Injectable()
export class HeroService {
  private readonly exampleRoster: Hero[] = [
    {
      id: '1',
      name: 'Silverwing',
      alias: 'Silver',
      powerClass: 'Aerial',
      powerIndex: 88,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 127,
      successRate: 96,
    },
    {
      id: '2',
      name: 'Dr. Ion',
      alias: 'The Ionizer',
      powerClass: 'Energy',
      powerIndex: 92,
      status: 'Active',
      clearanceTier: 'Tier5',
      missionCount: 164,
      successRate: 98,
    },
    {
      id: '3',
      name: 'Vantablack',
      alias: 'Shadow',
      powerClass: 'Enhanced',
      powerIndex: 85,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 143,
      successRate: 94,
    },
    {
      id: '4',
      name: 'Aurora Vale',
      alias: 'Aurora',
      powerClass: 'Psionic',
      powerIndex: 87,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 118,
      successRate: 95,
    },
    {
      id: '5',
      name: 'Magnetar',
      alias: 'Mag',
      powerClass: 'Cosmic',
      powerIndex: 89,
      status: 'Injured',
      clearanceTier: 'Tier4',
      missionCount: 156,
      successRate: 97,
    },
    {
      id: '6',
      name: 'The Tinkerer',
      alias: 'Tink',
      powerClass: 'Tech',
      powerIndex: 84,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 89,
      successRate: 92,
    },
    {
      id: '7',
      name: 'Halcyon',
      alias: 'Hal',
      powerClass: 'Aerial',
      powerIndex: 82,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 76,
      successRate: 91,
    },
    {
      id: '8',
      name: 'Rift',
      alias: 'The Fissure',
      powerClass: 'Mutant',
      powerIndex: 86,
      status: 'Reserve',
      clearanceTier: 'Tier3',
      missionCount: 104,
      successRate: 88,
    },
    {
      id: '9',
      name: 'Ember Cho',
      alias: 'Ember',
      powerClass: 'Energy',
      powerIndex: 81,
      status: 'Active',
      clearanceTier: 'Tier2',
      missionCount: 52,
      successRate: 89,
    },
    {
      id: '10',
      name: 'Null',
      alias: 'The Void',
      powerClass: 'Psionic',
      powerIndex: 90,
      status: 'Active',
      clearanceTier: 'Tier5',
      missionCount: 178,
      successRate: 99,
    },
    {
      id: '11',
      name: 'Grond',
      alias: 'The Hammer',
      powerClass: 'Enhanced',
      powerIndex: 79,
      status: 'MIA',
      clearanceTier: 'Tier2',
      missionCount: 67,
      successRate: 85,
    },
    {
      id: '12',
      name: 'Ms. Meridian',
      alias: 'Meridian',
      powerClass: 'Cosmic',
      powerIndex: 83,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 98,
      successRate: 93,
    },
  ];

  private readonly heroesSignal = signal<Hero[]>(this.exampleRoster);

  readonly heroes = this.heroesSignal.asReadonly();

  heroById(id: string): Hero | undefined {
    return this.heroesSignal().find((h) => h.id === id);
  }

  updateHero(id: string, updates: Partial<Omit<Hero, 'id'>>): void {
    this.heroesSignal.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    );
  }

  addHero(hero: Hero): void {
    this.heroesSignal.update((heroes) => [...heroes, hero]);
  }
}
