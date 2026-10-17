import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import type { Hero } from '../domain/hero.model';
import { STATUS_VARIANT } from '../ui/hero-card/hero-card';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

type BadgeVariant = NonNullable<BadgeVariants['variant']>;

export interface DashboardStat {
  label: string;
  value: number;
  hint: string;
  icon: StatIcon;
}

export interface DashboardRosterRow {
  readonly hero: Hero;
  readonly statusVariant: BadgeVariant;
}

const TOP_HEROES_COUNT = 4;

// Component-scoped: the dashboard provides it, so each visit gets fresh derived state.
@Injectable()
export class DashboardViewModel {
  private readonly _heroes = inject(HeroService).heroes;

  public readonly heroCount = computed(() => this._heroes().length);

  public readonly stats = computed<DashboardStat[]>(() => {
    const heroes = this._heroes();
    const total = heroes.length;
    const activeCount = heroes.filter((hero) => hero.status === 'Active').length;
    const missionCount = heroes.reduce((sum, hero) => sum + hero.missions, 0);
    const powerSum = heroes.reduce((sum, hero) => sum + hero.powerIndex, 0);
    const atRiskCount = heroes.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;

    return [
      { label: 'Heroes', value: total, hint: `${activeCount} active`, icon: 'lucideUserCheck' },
      { label: 'Missions', value: missionCount, hint: 'Logged to date', icon: 'lucideActivity' },
      {
        label: 'Average power',
        value: total > 0 ? Math.round(powerSum / total) : 0,
        hint: 'Out of 100',
        icon: 'lucideZap',
      },
      { label: 'Threats', value: atRiskCount, hint: 'Injured or MIA', icon: 'lucideShieldAlert' },
    ];
  });

  public readonly topHeroes = computed(() => this.strongestFirst().slice(0, TOP_HEROES_COUNT));

  public readonly roster = computed<DashboardRosterRow[]>(() =>
    this.strongestFirst().map((hero) => ({ hero, statusVariant: STATUS_VARIANT[hero.status] })),
  );

  private readonly strongestFirst = computed(() => [...this._heroes()].sort((a, b) => b.powerIndex - a.powerIndex));
}
