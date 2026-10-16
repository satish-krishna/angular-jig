import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Hero } from '../domain/hero.model';
import { statusTone, type StatusTone } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';

/** One roster row on the dashboard: the hero plus the badge tone for its status. */
export interface DashboardRosterRow {
  readonly hero: Hero;
  readonly statusTone: StatusTone;
}

/** How many heroes the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

/** The dashboard's state: headline figures and the top-of-roster selection. Component-scoped, not a store. */
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  readonly heroCount = computed(() => this.heroes.heroes().length);

  readonly activeCount = computed(() => this.heroes.heroes().filter((hero) => hero.status === 'Active').length);

  /** Heroes who are injured or missing, the figure the attention tile reports. */
  readonly attentionCount = computed(
    () => this.heroes.heroes().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );

  readonly missionsRun = computed(() => this.heroes.heroes().reduce((sum, hero) => sum + hero.missions, 0));

  readonly averagePower = computed(() => {
    const roster = this.heroes.heroes();
    if (roster.length === 0) return 0;
    const total = roster.reduce((sum, hero) => sum + hero.powerIndex, 0);
    return Math.round(total / roster.length);
  });

  readonly topHeroes = computed(() =>
    [...this.heroes.heroes()].sort((a, b) => b.powerIndex - a.powerIndex).slice(0, TOP_HERO_COUNT),
  );

  /** The whole roster, strongest first, for the roster table at the foot of the dashboard. */
  readonly roster = computed<readonly DashboardRosterRow[]>(() =>
    [...this.heroes.heroes()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({ hero, statusTone: statusTone(hero.status) })),
  );

  openHero(hero: Hero): void {
    void this.router.navigate(['/detail', hero.id]);
  }
}
