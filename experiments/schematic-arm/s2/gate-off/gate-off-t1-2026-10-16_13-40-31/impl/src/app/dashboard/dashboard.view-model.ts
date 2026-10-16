import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';

/** How many heroes the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

/** Derives the dashboard's figures from the hero store. Component-scoped; no DOM. */
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);

  readonly rosterCount = this.heroes.count;

  readonly activeCount = computed(
    () => this.heroes.list().filter((hero) => hero.status === 'Active').length,
  );

  readonly needsAttentionCount = computed(
    () =>
      this.heroes
        .list()
        .filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );

  readonly missionsLogged = computed(() =>
    this.heroes.list().reduce((total, hero) => total + hero.missionCount, 0),
  );

  readonly averagePower = computed(() => {
    const list = this.heroes.list();
    if (list.length === 0) return 0;
    return Math.round(list.reduce((total, hero) => total + hero.powerIndex, 0) / list.length);
  });

  /** Every hero, strongest first, for the roster table. */
  readonly roster = computed(() =>
    [...this.heroes.list()].sort((a, b) => b.powerIndex - a.powerIndex),
  );

  readonly topHeroes = computed(() => this.roster().slice(0, TOP_HERO_COUNT));
}
