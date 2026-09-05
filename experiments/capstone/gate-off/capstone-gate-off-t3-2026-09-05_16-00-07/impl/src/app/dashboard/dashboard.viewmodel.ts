import { Injectable, inject } from '@angular/core';
import { computed } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);

  readonly heroes = this.heroService.heroes;
  readonly heroCount = this.heroService.heroCount;

  readonly totalHeroes = computed(() => this.heroes().length);

  readonly missionsLive = computed(() => {
    return this.heroes()
      .filter(h => h.status === 'Active')
      .reduce((sum, h) => sum + h.missionCount, 0);
  });

  readonly averagePower = computed(() => {
    const heroes = this.heroes();
    if (heroes.length === 0) return 0;
    const total = heroes.reduce((sum, h) => sum + h.powerIndex, 0);
    return Math.round(total / heroes.length);
  });

  readonly threatsActive = computed(() => {
    return this.heroes().filter(h => h.status !== 'Active').length;
  });

  readonly topHeroes = computed(() => {
    return [...this.heroes()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, 4);
  });
}
