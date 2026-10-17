import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../hero/hero.service';

// How many heroes the "top this cycle" grid shows.
const TOP_HEROES = 4;

/**
 * Dashboard state: the headline figures and the top-heroes ranking, derived from the roster.
 * Component-scoped, so each visit to the screen computes from the same roster signal and
 * nothing here is a root-level store.
 */
@Injectable()
export class DashboardViewModel {
  private readonly roster = inject(HeroService).heroes;

  readonly rosterCount = computed(() => this.roster().length);
  readonly activeCount = computed(() => this.roster().filter((hero) => hero.status === 'Active').length);
  readonly sidelinedCount = computed(
    () => this.roster().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );
  readonly missionsLogged = computed(() => this.roster().reduce((sum, hero) => sum + hero.missions, 0));
  readonly averagePower = computed(() => {
    const count = this.rosterCount();
    if (count === 0) return 0;
    return Math.round(this.roster().reduce((sum, hero) => sum + hero.power, 0) / count);
  });
  readonly topHeroes = computed(() =>
    [...this.roster()].sort((a, b) => b.power - a.power).slice(0, TOP_HEROES),
  );
}
