import { Injectable, signal, computed } from '@angular/core';
import { Hero } from './hero.model';

/**
 * Example data: in-memory roster from the spec's content section.
 * This is sample data for the prototype; a real implementation would
 * fetch from a backend.
 */
const EXAMPLE_ROSTER: Hero[] = [
  {
    id: 'HRO-0007',
    name: 'Silverwing',
    alias: 'Ada Voss',
    powerClass: 'Aerial',
    powerIndex: 88,
    status: 'Active',
    clearanceTier: 'Tier 4',
    missionCount: 64,
    successRate: 92,
    bio: 'Precision flyer. Excels at extraction and high-altitude recon. Pairs well with ground-anchor heroes on breach ops.',
  },
  {
    id: 'HRO-0012',
    name: 'Dr. Ion',
    alias: 'Marcus Reyes',
    powerClass: 'Energy',
    powerIndex: 94,
    status: 'Active',
    clearanceTier: 'Tier 5',
    missionCount: 118,
    successRate: 88,
    bio: 'Directed-energy specialist. High output, needs a cooldown window between deployments.',
  },
  {
    id: 'HRO-0021',
    name: 'Vantablack',
    alias: 'Unknown',
    powerClass: 'Psionic',
    powerIndex: 81,
    status: 'Reserve',
    clearanceTier: 'Tier 3',
    missionCount: 29,
    successRate: 79,
    bio: 'Stealth and misdirection. Prefers solo infiltration; low profile by design.',
  },
  {
    id: 'HRO-0033',
    name: 'Aurora Vale',
    alias: 'Lena Park',
    powerClass: 'Cosmic',
    powerIndex: 97,
    status: 'Active',
    clearanceTier: 'Tier 5',
    missionCount: 151,
    successRate: 90,
    bio: 'Cosmic-tier heavy hitter. Reserved for tier-4 and tier-5 threat responses only.',
  },
  {
    id: 'HRO-0040',
    name: 'Magnetar',
    alias: 'Idris Kane',
    powerClass: 'Enhanced',
    powerIndex: 76,
    status: 'Injured',
    clearanceTier: 'Tier 3',
    missionCount: 57,
    successRate: 84,
    bio: 'Magnetic-field control. Currently on medical hold after Harbor Breach.',
  },
  {
    id: 'HRO-0044',
    name: 'The Tinkerer',
    alias: 'Sam Okafor',
    powerClass: 'Tech',
    powerIndex: 69,
    status: 'Active',
    clearanceTier: 'Tier 2',
    missionCount: 22,
    successRate: 95,
    bio: 'Gadget and drone support. Force multiplier on any team; rarely deployed alone.',
  },
  {
    id: 'HRO-0051',
    name: 'Halcyon',
    alias: 'Priya Nair',
    powerClass: 'Psionic',
    powerIndex: 85,
    status: 'Active',
    clearanceTier: 'Tier 4',
    missionCount: 73,
    successRate: 87,
    bio: 'Crowd-calming empath. De-escalation specialist for civilian-dense operations.',
  },
  {
    id: 'HRO-0058',
    name: 'Rift',
    alias: 'Classified',
    powerClass: 'Cosmic',
    powerIndex: 91,
    status: 'Reserve',
    clearanceTier: 'Tier 4',
    missionCount: 44,
    successRate: 82,
    bio: 'Short-range teleport. Powerful but unstable; flagged for supervised deployment.',
  },
  {
    id: 'HRO-0063',
    name: 'Ember Cho',
    alias: 'Jae Cho',
    powerClass: 'Energy',
    powerIndex: 78,
    status: 'Active',
    clearanceTier: 'Tier 3',
    missionCount: 48,
    successRate: 86,
    bio: 'Thermal projection. Strong area control, watch collateral on urban ops.',
  },
  {
    id: 'HRO-0070',
    name: 'Null',
    alias: 'Unknown',
    powerClass: 'Mutant',
    powerIndex: 83,
    status: 'MIA',
    clearanceTier: 'Tier 4',
    missionCount: 66,
    successRate: 80,
    bio: 'Power-nullification field. Last seen during Operation Nightfall; status unresolved.',
  },
  {
    id: 'HRO-0075',
    name: 'Grond',
    alias: 'Boris Volkov',
    powerClass: 'Enhanced',
    powerIndex: 72,
    status: 'Active',
    clearanceTier: 'Tier 2',
    missionCount: 31,
    successRate: 90,
    bio: 'Raw strength and durability. The wall the rest of the team stands behind.',
  },
  {
    id: 'HRO-0081',
    name: 'Ms. Meridian',
    alias: 'Grace Bello',
    powerClass: 'Tech',
    powerIndex: 80,
    status: 'Active',
    clearanceTier: 'Tier 3',
    missionCount: 59,
    successRate: 89,
    bio: 'Tactical AI handler. Coordinates multi-hero ops from the field.',
  },
];

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroesSignal = signal<Hero[]>(EXAMPLE_ROSTER);

  all = computed(() => this.heroesSignal());
  count = computed(() => this.heroesSignal().length);

  constructor() {}

  byId(id: string): Hero | undefined {
    return this.heroesSignal().find((h) => h.id === id);
  }

  update(id: string, changes: Partial<Hero>): void {
    this.heroesSignal.update((heroes) =>
      heroes.map((h) => (h.id === id ? { ...h, ...changes } : h))
    );
  }

  retire(id: string): void {
    this.heroesSignal.update((heroes) => heroes.filter((h) => h.id !== id));
  }

  add(hero: Omit<Hero, 'id'>): void {
    const maxId = Math.max(...EXAMPLE_ROSTER.map((h) => parseInt(h.id.split('-')[1], 10)));
    const newId = `HRO-${String(maxId + 1).padStart(4, '0')}`;
    this.heroesSignal.update((heroes) => [...heroes, { ...hero, id: newId }]);
  }
}
