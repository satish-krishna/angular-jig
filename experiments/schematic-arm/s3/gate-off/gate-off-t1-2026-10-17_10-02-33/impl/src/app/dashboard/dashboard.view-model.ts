import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { rosterRow, type RosterRow } from '../ui/roster-table';
import type { StatIcon } from '../ui/stat-tile';

export interface DashboardStat {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly hint: string;
  readonly icon: StatIcon;
}

const TOP_HERO_COUNT = 4;

// The dashboard's state and arithmetic, with no DOM. Component-scoped: the Dashboard component provides it.
@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly roster = this.heroService.heroes;

  readonly rosterCount = computed(() => this.roster().length);

  readonly stats = computed<readonly DashboardStat[]>(() => {
    const roster = this.roster();
    const active = roster.filter((hero) => hero.status === 'Active').length;
    const alerts = roster.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;
    const missions = roster.reduce((total, hero) => total + hero.missionCount, 0);
    const power = roster.reduce((total, hero) => total + hero.powerIndex, 0);

    return [
      { id: 'heroes', label: 'Heroes on roster', value: roster.length, hint: `${active} active`, icon: 'lucideUserCheck' },
      { id: 'missions', label: 'Missions on record', value: missions, hint: 'Across the full roster', icon: 'lucideActivity' },
      {
        id: 'power',
        label: 'Average power',
        value: roster.length ? Math.round(power / roster.length) : 0,
        hint: 'Power index, 0 to 100',
        icon: 'lucideZap',
      },
      { id: 'alerts', label: 'Open alerts', value: alerts, hint: 'Injured or missing in action', icon: 'lucideShieldAlert' },
    ];
  });

  private readonly strongestFirst = computed(() => [...this.roster()].sort((a, b) => b.powerIndex - a.powerIndex));

  readonly topHeroes = computed(() => this.strongestFirst().slice(0, TOP_HERO_COUNT));

  readonly rosterRows = computed<readonly RosterRow[]>(() => this.strongestFirst().map(rosterRow));
}
