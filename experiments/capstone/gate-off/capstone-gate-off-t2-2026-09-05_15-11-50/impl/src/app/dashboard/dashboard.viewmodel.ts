import { Injectable, inject, computed } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class DashboardViewModel {
  private heroService = inject(HeroService);

  heroes = this.heroService.heroes$;

  // Stat metrics
  heroCount = computed(() => this.heroes().length);

  missionsLive = computed(() => {
    return this.heroes()
      .filter((h) => h.status === 'Active')
      .reduce((sum, h) => sum + h.missionCount, 0);
  });

  avgPower = computed(() => {
    const heroes = this.heroes();
    if (heroes.length === 0) return 0;
    const total = heroes.reduce((sum, h) => sum + h.powerIndex, 0);
    return Math.round(total / heroes.length);
  });

  threatCount = computed(() => {
    return this.heroes().filter((h) => h.status === 'MIA' || h.status === 'Injured').length;
  });

  // Top 4 heroes by power index
  topHeroes = computed(() => {
    return this.heroes()
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, 4);
  });
}
