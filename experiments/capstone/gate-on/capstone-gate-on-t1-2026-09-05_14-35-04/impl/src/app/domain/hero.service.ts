import { Injectable, computed, signal } from '@angular/core';
import type { Hero } from './hero.model';

@Injectable({ providedIn: 'root' })
export class HeroService {
  /**
   * Example data roster. This is a prototype console backed by in-memory state,
   * not a production backend. In a real app, this service would fetch from an API.
   */
  private readonly heroesData: Hero[] = [
    {
      id: '1',
      name: 'Silverwing',
      alias: 'The Swift Sentinel',
      powerClass: 'Aerial',
      powerIndex: 87,
      status: 'Active',
      clearanceTier: 'Tier2',
      missionCount: 42,
      successRate: 0.95,
    },
    {
      id: '2',
      name: 'Dr. Ion',
      alias: 'Electro Guardian',
      powerClass: 'Energy',
      powerIndex: 92,
      status: 'Active',
      clearanceTier: 'Tier1',
      missionCount: 68,
      successRate: 0.98,
    },
    {
      id: '3',
      name: 'Vantablack',
      alias: 'The Shadow',
      powerClass: 'Psionic',
      powerIndex: 78,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 35,
      successRate: 0.91,
    },
    {
      id: '4',
      name: 'Aurora Vale',
      alias: 'Dawnbringer',
      powerClass: 'Cosmic',
      powerIndex: 88,
      status: 'Active',
      clearanceTier: 'Tier2',
      missionCount: 51,
      successRate: 0.96,
    },
    {
      id: '5',
      name: 'Magnetar',
      alias: 'The Magnetic Force',
      powerClass: 'Tech',
      powerIndex: 84,
      status: 'Injured',
      clearanceTier: 'Tier2',
      missionCount: 44,
      successRate: 0.93,
    },
    {
      id: '6',
      name: 'The Tinkerer',
      alias: 'Dr. Gadget',
      powerClass: 'Tech',
      powerIndex: 81,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 38,
      successRate: 0.89,
    },
    {
      id: '7',
      name: 'Halcyon',
      alias: 'The Peaceful One',
      powerClass: 'Enhanced',
      powerIndex: 79,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 29,
      successRate: 0.86,
    },
    {
      id: '8',
      name: 'Rift',
      alias: 'Void Walker',
      powerClass: 'Psionic',
      powerIndex: 89,
      status: 'Reserve',
      clearanceTier: 'Tier1',
      missionCount: 25,
      successRate: 0.92,
    },
    {
      id: '9',
      name: 'Ember Cho',
      alias: 'Flame Heart',
      powerClass: 'Energy',
      powerIndex: 85,
      status: 'Active',
      clearanceTier: 'Tier2',
      missionCount: 47,
      successRate: 0.94,
    },
    {
      id: '10',
      name: 'Null',
      alias: 'The Invisible',
      powerClass: 'Psionic',
      powerIndex: 86,
      status: 'Active',
      clearanceTier: 'Tier2',
      missionCount: 53,
      successRate: 0.97,
    },
    {
      id: '11',
      name: 'Grond',
      alias: 'The Unstoppable',
      powerClass: 'Mutant',
      powerIndex: 91,
      status: 'MIA',
      clearanceTier: 'Tier1',
      missionCount: 18,
      successRate: 0.72,
    },
    {
      id: '12',
      name: 'Ms. Meridian',
      alias: 'Compass',
      powerClass: 'Enhanced',
      powerIndex: 80,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 40,
      successRate: 0.90,
    },
  ];

  private readonly heroes = signal<Hero[]>(this.heroesData);
  readonly heroList = this.heroes.asReadonly();
  readonly heroCount = computed(() => this.heroes().length);

  getHeroById(id: string): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  updateHero(id: string, updates: Partial<Hero>): void {
    this.heroes.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    );
  }

  addHero(hero: Hero): void {
    this.heroes.update((heroes) => [...heroes, hero]);
  }

  removeHero(id: string): void {
    this.heroes.update((heroes) => heroes.filter((h) => h.id !== id));
  }
}
