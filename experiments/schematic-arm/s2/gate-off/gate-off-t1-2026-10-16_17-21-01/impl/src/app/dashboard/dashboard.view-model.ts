import { Injectable, computed, inject } from '@angular/core';
import { HERO_STATUSES } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';

const TOP_HERO_COUNT = 4;

// Component-scoped (the Dashboard component provides it). Derives every number
// and list the dashboard shows from the roster, so the component stays a shell.
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);

  readonly rosterCount = computed(() => this.heroes.roster().length);

  readonly missionTotal = computed(() =>
    this.heroes.roster().reduce((total, hero) => total + hero.missionCount, 0),
  );

  readonly averagePower = computed(() => {
    const roster = this.heroes.roster();
    if (roster.length === 0) {
      return 0;
    }
    const total = roster.reduce((sum, hero) => sum + hero.powerIndex, 0);
    return Math.round(total / roster.length);
  });

  // Injured and MIA heroes are the ones the roster cannot currently deploy.
  readonly needsAttention = computed(
    () => this.heroes.roster().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );

  readonly topHeroes = computed(() =>
    [...this.heroes.roster()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, TOP_HERO_COUNT),
  );

  // How many heroes sit in each status, in the roster's own status order.
  readonly statusCounts = computed(() => {
    const roster = this.heroes.roster();
    return HERO_STATUSES.map((status) => ({
      status,
      count: roster.filter((hero) => hero.status === status).length,
    }));
  });
}
