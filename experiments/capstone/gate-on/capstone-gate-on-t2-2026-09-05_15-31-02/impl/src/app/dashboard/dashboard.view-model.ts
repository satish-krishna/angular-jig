import { Injectable, inject, computed } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  readonly heroes = this.heroService.heroes;

  readonly totalHeroes = computed(() => this.heroes().length);
  readonly missionsLive = computed(() =>
    this.heroes().filter((h) => h.status === 'Active').reduce((sum, h) => sum + h.missionCount, 0),
  );
  readonly averagePower = computed(() => {
    const heroes = this.heroes();
    return heroes.length > 0 ? Math.round(heroes.reduce((sum, h) => sum + h.powerIndex, 0) / heroes.length) : 0;
  });
  readonly threatCount = computed(() => this.heroes().filter((h) => h.status === 'Injured' || h.status === 'MIA').length);

  readonly topHeroes = computed(() =>
    [...this.heroes()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, 4),
  );

  readonly sortedHeroes = computed(() =>
    [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex),
  );

  readonly activeHeroes = computed(() => this.heroes().filter((h) => h.status === 'Active'));
}
