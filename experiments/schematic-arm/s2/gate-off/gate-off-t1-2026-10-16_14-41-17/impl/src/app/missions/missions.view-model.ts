import { computed, inject, Injectable, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';

/**
 * State for the missions screen: the mission ledger across the roster and the
 * deploy action. Component-scoped, so it dies with the screen.
 */
@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);

  /** A short status line after a deployment. */
  readonly notice = signal('');

  /** The roster, most missions first. */
  readonly heroes = computed(() =>
    [...this.heroService.heroes()].sort((a, b) => b.missionCount - a.missionCount || a.name.localeCompare(b.name)),
  );

  readonly missionTotal = computed(() => this.heroes().reduce((total, hero) => total + hero.missionCount, 0));

  readonly deployableCount = computed(() => this.heroes().filter((hero) => hero.status === 'Active').length);

  readonly averageSuccess = computed(() => {
    const heroes = this.heroes();
    return heroes.length === 0
      ? 0
      : Math.round(heroes.reduce((total, hero) => total + hero.successRate, 0) / heroes.length);
  });

  /** Log one mission for an Active hero and say so. */
  deploy(id: string): void {
    const name = this.heroService.byId(id)?.name;
    const missionCount = this.heroService.deploy(id);
    if (name !== undefined && missionCount !== undefined) {
      this.notice.set(`${name} deployed. Missions logged: ${missionCount}.`);
    }
  }
}
