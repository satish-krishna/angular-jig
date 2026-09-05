import { Injectable, inject, computed } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class DashboardViewModel {
  private heroService = inject(HeroService);

  heroes = this.heroService.all;
  heroCount = this.heroService.count;

  topHeroes = computed(() => {
    const sorted = [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex);
    return sorted.slice(0, 4);
  });

  activeMissions = computed(() => {
    return this.heroes().filter((h) => h.status === 'Active').length;
  });

  avgPower = computed(() => {
    const heroes = this.heroes();
    if (heroes.length === 0) return 0;
    const sum = heroes.reduce((acc, h) => acc + h.powerIndex, 0);
    return Math.round(sum / heroes.length);
  });

  threatCount = computed(() => {
    return this.heroes().filter((h) => h.status === 'Injured' || h.status === 'MIA').length;
  });

  navigateToRecruit(): void {
    // This will be called from the component
  }
}
