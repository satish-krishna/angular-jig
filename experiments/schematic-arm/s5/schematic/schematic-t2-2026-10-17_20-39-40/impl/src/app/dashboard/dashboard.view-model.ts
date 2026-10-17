import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

export interface DashboardStat {
  readonly key: string;
  readonly label: string;
  readonly value: string | number;
  readonly hint: string;
  readonly icon: StatIcon;
  readonly tone: 'default' | 'warning';
}

const TOP_HERO_COUNT = 4;

// Component-scoped (no providedIn): the Dashboard component provides it.
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);

  readonly rosterCount = computed(() => this.heroes.heroes().length);

  readonly stats = computed<readonly DashboardStat[]>(() => {
    const roster = this.heroes.heroes();
    const active = roster.filter((hero) => hero.status === 'Active').length;
    const attention = roster.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;
    const totalPower = roster.reduce((sum, hero) => sum + hero.power, 0);
    const averagePower = roster.length ? Math.round(totalPower / roster.length) : 0;

    return [
      { key: 'heroes', label: 'Heroes on file', value: roster.length, hint: 'Full roster', icon: 'lucideUserCheck', tone: 'default' },
      { key: 'active', label: 'Active now', value: active, hint: 'Cleared for deployment', icon: 'lucideActivity', tone: 'default' },
      { key: 'power', label: 'Average power', value: averagePower, hint: 'Index across the roster', icon: 'lucideZap', tone: 'default' },
      { key: 'attention', label: 'Needs attention', value: attention, hint: 'Injured or MIA', icon: 'lucideTriangleAlert', tone: 'warning' },
    ];
  });

  readonly topHeroes = computed(() =>
    [...this.heroes.heroes()].sort((a, b) => b.power - a.power).slice(0, TOP_HERO_COUNT),
  );
}
