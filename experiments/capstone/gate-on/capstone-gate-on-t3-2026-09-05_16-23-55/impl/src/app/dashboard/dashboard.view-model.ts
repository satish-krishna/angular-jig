import { Injectable, inject, computed } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);

  readonly allHeroes = this.heroService.heroes;
  readonly heroCount = computed(() => this.allHeroes().length);

  readonly topHeroes = computed(() =>
    this.allHeroes()
      .slice()
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, 4)
  );

  readonly activeMissionsCount = computed(() => {
    return Math.floor(Math.random() * 10) + 5;
  });

  readonly averagePower = computed(() => {
    const heroes = this.allHeroes();
    if (heroes.length === 0) return 0;
    const sum = heroes.reduce((acc, h) => acc + h.powerIndex, 0);
    return Math.round(sum / heroes.length);
  });

  readonly threatsCount = computed(() => {
    return Math.floor(Math.random() * 5) + 3;
  });

  readonly activeHeroes = computed(() =>
    this.allHeroes().filter((h) => h.status === 'Active').length
  );
}
