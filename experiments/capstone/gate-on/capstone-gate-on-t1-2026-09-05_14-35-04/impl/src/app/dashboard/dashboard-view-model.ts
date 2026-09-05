import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);

  readonly heroList = this.heroService.heroList;
  readonly heroCount = this.heroService.heroCount;

  readonly activeHeroes = computed(() =>
    this.heroList().filter((h) => h.status === 'Active').length,
  );

  readonly missionsLive = computed(() =>
    this.heroList().reduce((sum, h) => sum + h.missionCount, 0),
  );

  readonly avgPower = computed(() => {
    const heroes = this.heroList();
    if (heroes.length === 0) return 0;
    const sum = heroes.reduce((acc, h) => acc + h.powerIndex, 0);
    return Math.round(sum / heroes.length);
  });

  readonly threatCount = computed(() =>
    this.heroList().filter((h) => h.status === 'MIA').length,
  );

  readonly topHeroes = computed(() =>
    [...this.heroList()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, 4),
  );
}
