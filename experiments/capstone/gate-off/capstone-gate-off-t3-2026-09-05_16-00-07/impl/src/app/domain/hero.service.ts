import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import type { Hero } from './hero.model';

/**
 * HeroService holds the example roster as in-memory signal state.
 * This is example data for the capstone build. There is no backend.
 * The roster is derived from the build spec's content section.
 */
@Injectable()
export class HeroService {
  private readonly heroesSignal = signal<Hero[]>([
    {
      id: 'hero-001',
      name: 'Silverwing',
      alias: 'The Untouchable',
      powerClass: 'Aerial',
      powerIndex: 92,
      status: 'Active',
      clearanceTier: 'Tier5',
      missionCount: 127,
      successRate: 0.98,
    },
    {
      id: 'hero-002',
      name: 'Dr. Ion',
      alias: 'The Charged',
      powerClass: 'Energy',
      powerIndex: 85,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 94,
      successRate: 0.96,
    },
    {
      id: 'hero-003',
      name: 'Vantablack',
      alias: 'The Shadow',
      powerClass: 'Psionic',
      powerIndex: 88,
      status: 'Active',
      clearanceTier: 'Tier5',
      missionCount: 112,
      successRate: 0.97,
    },
    {
      id: 'hero-004',
      name: 'Aurora Vale',
      alias: 'The Light',
      powerClass: 'Energy',
      powerIndex: 79,
      status: 'Injured',
      clearanceTier: 'Tier3',
      missionCount: 76,
      successRate: 0.94,
    },
    {
      id: 'hero-005',
      name: 'Magnetar',
      alias: 'The Attractor',
      powerClass: 'Tech',
      powerIndex: 82,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 88,
      successRate: 0.95,
    },
    {
      id: 'hero-006',
      name: 'The Tinkerer',
      alias: 'Forge',
      powerClass: 'Tech',
      powerIndex: 75,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 64,
      successRate: 0.92,
    },
    {
      id: 'hero-007',
      name: 'Halcyon',
      alias: 'The Serene',
      powerClass: 'Psionic',
      powerIndex: 84,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 102,
      successRate: 0.96,
    },
    {
      id: 'hero-008',
      name: 'Rift',
      alias: 'The Breach',
      powerClass: 'Cosmic',
      powerIndex: 90,
      status: 'Reserve',
      clearanceTier: 'Tier5',
      missionCount: 68,
      successRate: 0.99,
    },
    {
      id: 'hero-009',
      name: 'Ember Cho',
      alias: 'The Inferno',
      powerClass: 'Energy',
      powerIndex: 81,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 91,
      successRate: 0.93,
    },
    {
      id: 'hero-010',
      name: 'Null',
      alias: 'The Void',
      powerClass: 'Cosmic',
      powerIndex: 87,
      status: 'Active',
      clearanceTier: 'Tier5',
      missionCount: 78,
      successRate: 0.98,
    },
    {
      id: 'hero-011',
      name: 'Grond',
      alias: 'The Unbreakable',
      powerClass: 'Mutant',
      powerIndex: 86,
      status: 'Active',
      clearanceTier: 'Tier4',
      missionCount: 156,
      successRate: 0.94,
    },
    {
      id: 'hero-012',
      name: 'Ms. Meridian',
      alias: 'The Navigator',
      powerClass: 'Enhanced',
      powerIndex: 77,
      status: 'Active',
      clearanceTier: 'Tier3',
      missionCount: 73,
      successRate: 0.95,
    },
  ]);

  readonly heroes = this.heroesSignal.asReadonly();
  readonly heroCount = computed(() => this.heroesSignal().length);

  getHeroById(id: string): Hero | undefined {
    return this.heroesSignal().find(h => h.id === id);
  }

  updateHero(id: string, partial: Partial<Hero>): void {
    this.heroesSignal.update(heroes =>
      heroes.map(h => h.id === id ? { ...h, ...partial } : h)
    );
  }

  addHero(hero: Hero): void {
    this.heroesSignal.update(heroes => [...heroes, hero]);
  }

  removeHero(id: string): void {
    this.heroesSignal.update(heroes => heroes.filter(h => h.id !== id));
  }
}
