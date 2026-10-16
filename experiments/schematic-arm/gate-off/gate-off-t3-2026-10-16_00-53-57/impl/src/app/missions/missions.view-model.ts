import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero';

// Owns the missions summary: totals across the roster and the per-hero deployment table. Component-scoped, no DOM.
// The roster record keeps totals only, so every figure here is derived from the shared hero store.
@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);
  private readonly heroes = this.heroService.heroes;

  readonly missionsOnRecord = computed(() => this.heroes().reduce((sum, hero) => sum + hero.missionCount, 0));

  readonly liveDeployments = computed(() => this.heroes().filter((hero) => hero.status === 'Active').length);

  // Weighted by mission count, so a hero with 151 missions counts for more than one with 22.
  readonly averageSuccess = computed(() => {
    const missions = this.missionsOnRecord();
    if (missions === 0) {
      return 0;
    }
    const successes = this.heroes().reduce((sum, hero) => sum + (hero.missionCount * hero.successRate) / 100, 0);
    return Math.round((successes / missions) * 100);
  });

  // Sorts a copy: the service's list is shared state and must not be reordered in place.
  readonly rows = computed<readonly Hero[]>(() =>
    [...this.heroes()].sort((a, b) => b.missionCount - a.missionCount),
  );
}
