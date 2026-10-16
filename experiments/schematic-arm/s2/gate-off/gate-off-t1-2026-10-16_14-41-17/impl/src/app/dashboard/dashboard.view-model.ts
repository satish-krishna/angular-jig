import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';

/** How many heroes the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

/**
 * State for the operations dashboard: the roster's headline numbers and the top
 * heroes by power index. Component-scoped, so it dies with the screen.
 */
@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly heroes = this.heroService.heroes;

  readonly rosterCount = computed(() => this.heroes().length);

  readonly activeCount = computed(() => this.heroes().filter((hero) => hero.status === 'Active').length);

  readonly activeHint = computed(() => `of ${this.rosterCount()} on the roster`);

  readonly missionTotal = computed(() => this.heroes().reduce((sum, hero) => sum + hero.missionCount, 0));

  readonly averagePower = computed(() => Math.round(this.sum(this.heroes().map((hero) => hero.powerIndex))));

  readonly averageSuccess = computed(() => Math.round(this.sum(this.heroes().map((hero) => hero.successRate))));

  /** The highest power indices on the roster, strongest first. */
  readonly topHeroes = computed(() =>
    [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex).slice(0, TOP_HERO_COUNT),
  );

  /** The whole roster by name, for the roster table. */
  readonly roster = computed(() => [...this.heroes()].sort((a, b) => a.name.localeCompare(b.name)));

  /** Opens a hero's dossier. */
  openDossier(id: string): void {
    void this.router.navigate(['/detail', id]);
  }

  /** The mean of the values, or 0 for an empty roster. */
  private sum(values: readonly number[]): number {
    return values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;
  }
}
