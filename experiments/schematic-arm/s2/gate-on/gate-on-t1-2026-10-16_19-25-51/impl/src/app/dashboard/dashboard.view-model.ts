import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { StatTileIcon } from '../ui/stat-tile/stat-tile';

/** How many heroes the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

export interface DashboardStat {
  readonly label: string;
  readonly value: string | number;
  readonly hint: string;
  readonly icon: StatTileIcon;
}

/** Derives the dashboard's figures from the roster. Holds no state of its own. */
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService).heroes;

  readonly rosterCount = computed(() => this.heroes().length);

  readonly stats = computed<readonly DashboardStat[]>(() => {
    const heroes = this.heroes();
    const active = heroes.filter((hero) => hero.status === 'Active').length;
    const attention = heroes.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;
    const missions = heroes.reduce((total, hero) => total + hero.missionCount, 0);
    const totalPower = heroes.reduce((total, hero) => total + hero.powerIndex, 0);
    const averagePower = heroes.length === 0 ? 0 : Math.round(totalPower / heroes.length);

    return [
      { label: 'Heroes', value: heroes.length, hint: `${active} active`, icon: 'lucideUserCheck' },
      { label: 'Missions logged', value: missions, hint: 'Across the full roster', icon: 'lucideActivity' },
      { label: 'Average power', value: averagePower, hint: 'Power index, 0 to 100', icon: 'lucideZap' },
      { label: 'Needs attention', value: attention, hint: 'Injured or MIA', icon: 'lucideShieldAlert' },
    ];
  });

  /** The whole roster, strongest first, for the dashboard's roster table. */
  readonly rosterByPower = computed(() => [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex));

  /** The highest power indices on the roster, strongest first. */
  readonly topHeroes = computed(() => this.rosterByPower().slice(0, TOP_HERO_COUNT));
}
