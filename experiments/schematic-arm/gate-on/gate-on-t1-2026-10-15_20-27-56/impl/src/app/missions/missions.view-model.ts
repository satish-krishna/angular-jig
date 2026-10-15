import { computed, inject, Injectable, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero.model';

function byPower(a: Hero, b: Hero): number {
  return b.power - a.power;
}

// Component-scoped: provided by Missions, so each visit reads the live roster.
@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);

  /** Heroes that can be sent out now: Active, highest power first. */
  readonly deployable = computed(() => this.heroService.heroes().filter((hero) => hero.status === 'Active').sort(byPower));

  /** Everyone else, with the reason they stay home shown by status. */
  readonly benched = computed(() => this.heroService.heroes().filter((hero) => hero.status !== 'Active').sort(byPower));

  readonly missionsOnRecord = computed(() => this.heroService.heroes().reduce((total, hero) => total + hero.missions, 0));

  readonly averageSuccess = computed(() => {
    const heroes = this.heroService.heroes();
    if (heroes.length === 0) return 0;
    return Math.round(heroes.reduce((total, hero) => total + hero.successRate, 0) / heroes.length);
  });

  /** Confirmation line shown after a deployment. Empty when there is nothing to report. */
  readonly notice = signal('');

  deploy(hero: Hero): void {
    this.heroService.deploy(hero.id);
    this.notice.set(`${hero.name} deployed.`);
  }
}
