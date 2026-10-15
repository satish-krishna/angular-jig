import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { toRosterRows } from '../ui/hero-presentation';

/** How many heroes the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

export interface DashboardStat {
  readonly label: string;
  readonly value: number;
  readonly hint: string;
  readonly icon: 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';
}

// Component-scoped: provided by Dashboard, so each visit gets a fresh derivation over the roster.
@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);

  readonly rosterCount = computed(() => this.heroService.heroes().length);

  /** The whole roster as table rows, highest power first. */
  readonly rosterRows = computed(() => toRosterRows(this.heroService.heroes()));

  readonly topHeroes = computed(() => this.rosterRows().slice(0, TOP_HERO_COUNT).map((row) => row.hero));

  readonly stats = computed<readonly DashboardStat[]>(() => {
    const heroes = this.heroService.heroes();
    const count = heroes.length;
    const active = heroes.filter((hero) => hero.status === 'Active').length;
    const injured = heroes.filter((hero) => hero.status === 'Injured').length;
    const mia = heroes.filter((hero) => hero.status === 'MIA').length;
    const missions = heroes.reduce((total, hero) => total + hero.missions, 0);
    const averagePower = count === 0 ? 0 : Math.round(heroes.reduce((total, hero) => total + hero.power, 0) / count);

    return [
      { label: 'Heroes on roster', value: count, hint: `${active} active`, icon: 'lucideUserCheck' },
      { label: 'Missions on record', value: missions, hint: 'Across the roster', icon: 'lucideActivity' },
      { label: 'Average power', value: averagePower, hint: 'Index, 0-100', icon: 'lucideZap' },
      { label: 'MIA heroes', value: mia, hint: `${injured} injured`, icon: 'lucideShieldAlert' },
    ];
  });
}
