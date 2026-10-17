import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { toHeroRow, type HeroRow } from '../ui/hero-display';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

export interface DashboardStat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon: StatIcon;
}

const TOP_HERO_COUNT = 4;

@Injectable() // no providedIn: scoped to the Dashboard component that provides it
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly heroes = this.heroService.list;

  readonly rosterCount = computed(() => this.heroes().length);

  // Derived from the roster. The roster is example data, so these figures are too.
  readonly stats = computed<readonly DashboardStat[]>(() => {
    const list = this.heroes();
    const active = list.filter((hero) => hero.status === 'Active').length;
    const needsAttention = list.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;
    const missions = list.reduce((sum, hero) => sum + hero.missionCount, 0);
    const averagePower = list.length
      ? Math.round(list.reduce((sum, hero) => sum + hero.powerIndex, 0) / list.length)
      : 0;

    return [
      { id: 'heroes', label: 'Heroes', value: String(list.length), detail: `${active} active`, icon: 'lucideUserCheck' },
      { id: 'missions', label: 'Missions on record', value: String(missions), detail: 'Across the roster', icon: 'lucideActivity' },
      { id: 'power', label: 'Average power', value: String(averagePower), detail: 'Power index, 0-100', icon: 'lucideZap' },
      { id: 'attention', label: 'Needs attention', value: String(needsAttention), detail: 'Injured or MIA', icon: 'lucideShieldAlert' },
    ];
  });

  // The whole roster, strongest first. Both the top heroes and the roster table read from it.
  private readonly byPower = computed<readonly Hero[]>(() =>
    [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex),
  );

  readonly topHeroes = computed<readonly Hero[]>(() => this.byPower().slice(0, TOP_HERO_COUNT));

  readonly roster = computed<readonly HeroRow[]>(() => this.byPower().map(toHeroRow));

  openHero(id: string): void {
    void this.router.navigate(['/detail', id]);
  }
}
