import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);

  readonly heroes = this.heroService.heroes;

  readonly totalHeroes = computed(() => this.heroes().length);
  readonly activeMissions = computed(() => 12);
  readonly averagePower = computed(() => {
    const heroes = this.heroes();
    return heroes.length
      ? Math.round(heroes.reduce((sum, h) => sum + h.power, 0) / heroes.length)
      : 0;
  });
  readonly threats = computed(() => 5);
  readonly topHeroes = computed(() =>
    this.heroes()
      .slice()
      .sort((a, b) => b.power - a.power)
      .slice(0, 4)
  );
}
