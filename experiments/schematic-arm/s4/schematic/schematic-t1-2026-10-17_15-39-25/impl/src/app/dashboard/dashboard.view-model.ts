import { Injectable, computed, inject } from '@angular/core';
import type { StatIcon } from '../ui/stat-tile/stat-tile';
import { HeroService } from '../domain/hero.service';
import { byPower, rosterRows } from '../domain/hero-display';

export interface DashboardStat {
  readonly label: string;
  readonly value: number;
  readonly hint: string;
  readonly icon: StatIcon;
}

const TOP_HERO_COUNT = 4;

// The dashboard's state and derivations. Component-scoped (provided by Dashboard), no DOM.
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService).heroes;

  readonly heroCount = computed(() => this.heroes().length);

  readonly stats = computed<readonly DashboardStat[]>(() => {
    const all = this.heroes();
    const total = all.reduce((sum, hero) => sum + hero.missions, 0);
    const averagePower = all.length
      ? Math.round(all.reduce((sum, hero) => sum + hero.power, 0) / all.length)
      : 0;
    const active = all.filter((hero) => hero.status === 'Active').length;
    const offDuty = all.length - active;
    return [
      { label: 'Heroes on roster', value: all.length, hint: `${active} active`, icon: 'lucideUserCheck' },
      { label: 'Missions logged', value: total, hint: 'Across all heroes', icon: 'lucideActivity' },
      { label: 'Average power', value: averagePower, hint: 'Index out of 100', icon: 'lucideZap' },
      { label: 'Off duty', value: offDuty, hint: 'Injured, reserve or MIA', icon: 'lucideShieldAlert' },
    ];
  });

  // Ranked by power index: the cycle's standout heroes.
  readonly topHeroes = computed(() => byPower(this.heroes()).slice(0, TOP_HERO_COUNT));

  // The same roster the Roster screen shows, read from the same shared service.
  readonly roster = computed(() => rosterRows(this.heroes()));
}
