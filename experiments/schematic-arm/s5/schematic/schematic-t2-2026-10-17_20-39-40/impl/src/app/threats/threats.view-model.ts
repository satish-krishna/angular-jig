import { Injectable, computed, inject } from '@angular/core';
import type { Hero } from '../hero/hero.model';
import { HeroService } from '../hero/hero.service';
import { isDeployable } from '../hero/hero-display';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

export interface ClearanceTier {
  readonly clearance: string;
  readonly heroes: readonly Hero[];
  readonly ready: number;
}

export interface ThreatStat {
  readonly key: string;
  readonly label: string;
  readonly value: string | number;
  readonly hint: string;
  readonly icon: StatIcon;
  readonly tone: 'default' | 'warning';
}

// Component-scoped (no providedIn): the Threats component provides it.
@Injectable()
export class ThreatsViewModel {
  private readonly heroService = inject(HeroService);

  /** Heroes grouped by clearance tier, highest tier first. Tiers come from the data, not a second list. */
  readonly tiers = computed<readonly ClearanceTier[]>(() => {
    const groups = new Map<string, Hero[]>();
    for (const hero of this.heroService.heroes()) {
      groups.set(hero.clearance, [...(groups.get(hero.clearance) ?? []), hero]);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
      .map(([clearance, heroes]) => ({
        clearance,
        heroes,
        ready: heroes.filter(isDeployable).length,
      }));
  });

  /** Heroes who cannot take a threat right now. */
  readonly attention = computed(() =>
    this.heroService.heroes().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA'),
  );

  readonly stats = computed<readonly ThreatStat[]>(() => [
    {
      key: 'tiers',
      label: 'Clearance tiers',
      value: this.tiers().length,
      hint: 'Tiers with at least one hero',
      icon: 'lucideShieldAlert',
      tone: 'default',
    },
    {
      key: 'attention',
      label: 'Needs attention',
      value: this.attention().length,
      hint: 'Injured or MIA',
      icon: 'lucideTriangleAlert',
      tone: 'warning',
    },
  ]);
}
