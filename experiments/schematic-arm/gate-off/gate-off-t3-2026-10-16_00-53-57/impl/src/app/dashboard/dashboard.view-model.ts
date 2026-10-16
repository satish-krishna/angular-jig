import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero';

const TOP_HERO_COUNT = 4;

// Owns the dashboard's figures, the top-heroes selection and the roster table. Component-scoped, no DOM.
@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly heroes = this.heroService.heroes;

  readonly rosterCount = computed(() => this.heroes().length);

  readonly activeCount = computed(() => this.heroes().filter((hero) => hero.status === 'Active').length);

  readonly averagePower = computed(() => {
    const all = this.heroes();
    if (all.length === 0) {
      return 0;
    }
    const total = all.reduce((sum, hero) => sum + hero.powerIndex, 0);
    return Math.round(total / all.length);
  });

  readonly attentionCount = computed(
    () => this.heroes().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );

  // Sorts a copy: the service's list is shared state and must not be reordered in place.
  readonly roster = computed<readonly Hero[]>(() => [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex));

  readonly topHeroes = computed<readonly Hero[]>(() => this.roster().slice(0, TOP_HERO_COUNT));
}
