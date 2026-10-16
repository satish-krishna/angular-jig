import { computed, inject, Injectable } from '@angular/core';
import type { StatIcon } from '../ui/stat-tile';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero';

export interface DashboardStat {
  readonly label: string;
  readonly value: number;
  readonly icon: StatIcon;
}

/** How many hero cards the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);

  readonly rosterCount = computed(() => this.heroes.heroes().length);

  readonly activeCount = computed(
    () => this.heroes.heroes().filter((hero) => hero.status === 'Active').length,
  );

  readonly missionTotal = computed(() =>
    this.heroes.heroes().reduce((sum, hero) => sum + hero.missionCount, 0),
  );

  readonly averagePower = computed(() => {
    const roster = this.heroes.heroes();
    if (roster.length === 0) return 0;
    const total = roster.reduce((sum, hero) => sum + hero.powerIndex, 0);
    return Math.round(total / roster.length);
  });

  /** Injured or MIA heroes: the roster items that need an operator's attention. */
  readonly attentionCount = computed(
    () =>
      this.heroes
        .heroes()
        .filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );

  /** The whole roster by codename, for the roster list under the hero cards. */
  readonly roster = computed<readonly Hero[]>(() =>
    [...this.heroes.heroes()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  readonly stats = computed<readonly DashboardStat[]>(() => [
    { label: 'Active heroes', value: this.activeCount(), icon: 'lucideUserCheck' },
    { label: 'Missions on record', value: this.missionTotal(), icon: 'lucideActivity' },
    { label: 'Average power', value: this.averagePower(), icon: 'lucideZap' },
    { label: 'Needs attention', value: this.attentionCount(), icon: 'lucideTriangleAlert' },
  ]);

  /** The strongest heroes by power index, strongest first. */
  readonly topHeroes = computed<readonly Hero[]>(() =>
    [...this.heroes.heroes()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, TOP_HERO_COUNT),
  );
}
