import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { rosterRowOf } from '../ui/hero-display';

const TOP_HERO_COUNT = 4;

// Dashboard state: roster figures, the top heroes by power index, and the full roster table.
// Component-scoped, provided by Dashboard.
@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly heroes = this.heroService.heroes;

  readonly heroCount = computed(() => this.heroes().length);
  readonly activeCount = computed(() => this.heroes().filter((hero) => hero.status === 'Active').length);
  readonly missionTotal = computed(() => this.heroes().reduce((sum, hero) => sum + hero.missionCount, 0));
  readonly averagePower = computed(() => {
    const count = this.heroCount();
    if (count === 0) {
      return 0;
    }
    const total = this.heroes().reduce((sum, hero) => sum + hero.powerIndex, 0);
    return Math.round(total / count);
  });
  // Injured or MIA heroes: the readiness gaps the dashboard flags.
  readonly flaggedCount = computed(
    () => this.heroes().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );
  readonly topHeroes = computed(() =>
    [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex).slice(0, TOP_HERO_COUNT),
  );
  readonly rosterRows = computed(() =>
    [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex).map(rosterRowOf),
  );
}
