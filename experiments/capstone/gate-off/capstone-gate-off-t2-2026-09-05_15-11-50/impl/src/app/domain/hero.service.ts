import { Injectable, signal } from '@angular/core';
import type { Hero } from './hero.model';

// Example data - kitchen-sink tour of heroes as a superhero agency mission control.
// This is in-memory fixture data; there is no backend.
const EXAMPLE_ROSTER: Hero[] = [
  {
    id: '1',
    name: 'Silverwing',
    alias: 'Agent Silverwing',
    powerClass: 'Aerial',
    powerIndex: 87,
    status: 'Active',
    clearanceTier: 'Tier4',
    missionCount: 42,
    successRate: 95,
  },
  {
    id: '2',
    name: 'Dr. Ion',
    alias: 'Ion Burst',
    powerClass: 'Energy',
    powerIndex: 91,
    status: 'Active',
    clearanceTier: 'Tier5',
    missionCount: 58,
    successRate: 92,
  },
  {
    id: '3',
    name: 'Vantablack',
    alias: 'The Shadow',
    powerClass: 'Psionic',
    powerIndex: 78,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 31,
    successRate: 88,
  },
  {
    id: '4',
    name: 'Aurora Vale',
    alias: 'Radiant',
    powerClass: 'Cosmic',
    powerIndex: 84,
    status: 'Injured',
    clearanceTier: 'Tier4',
    missionCount: 48,
    successRate: 90,
  },
  {
    id: '5',
    name: 'Magnetar',
    alias: 'Pole',
    powerClass: 'Energy',
    powerIndex: 88,
    status: 'Active',
    clearanceTier: 'Tier4',
    missionCount: 55,
    successRate: 91,
  },
  {
    id: '6',
    name: 'The Tinkerer',
    alias: 'Engineer',
    powerClass: 'Tech',
    powerIndex: 76,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 29,
    successRate: 86,
  },
  {
    id: '7',
    name: 'Halcyon',
    alias: 'Serene',
    powerClass: 'Psionic',
    powerIndex: 81,
    status: 'Active',
    clearanceTier: 'Tier4',
    missionCount: 38,
    successRate: 93,
  },
  {
    id: '8',
    name: 'Rift',
    alias: 'Void Walker',
    powerClass: 'Cosmic',
    powerIndex: 89,
    status: 'Reserve',
    clearanceTier: 'Tier4',
    missionCount: 44,
    successRate: 87,
  },
  {
    id: '9',
    name: 'Ember Cho',
    alias: 'Inferno',
    powerClass: 'Enhanced',
    powerIndex: 82,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 36,
    successRate: 89,
  },
  {
    id: '10',
    name: 'Null',
    alias: 'The Nullifier',
    powerClass: 'Mutant',
    powerIndex: 74,
    status: 'MIA',
    clearanceTier: 'Tier2',
    missionCount: 15,
    successRate: 73,
  },
  {
    id: '11',
    name: 'Grond',
    alias: 'Colossus',
    powerClass: 'Enhanced',
    powerIndex: 86,
    status: 'Active',
    clearanceTier: 'Tier4',
    missionCount: 51,
    successRate: 94,
  },
  {
    id: '12',
    name: 'Ms. Meridian',
    alias: 'Navigator',
    powerClass: 'Aerial',
    powerIndex: 79,
    status: 'Active',
    clearanceTier: 'Tier3',
    missionCount: 40,
    successRate: 91,
  },
];

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroes = signal<Hero[]>(EXAMPLE_ROSTER);

  heroes$ = this.heroes.asReadonly();

  getHeroById(id: string): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(id: string, updates: Partial<Hero>): void {
    this.heroes.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  }

  addHero(hero: Hero): void {
    this.heroes.update((heroes) => [...heroes, hero]);
  }
}
