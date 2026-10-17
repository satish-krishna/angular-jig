import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';

/** Every piece of copy the missions screen shows. The template binds to these and never repeats them. */
const MISSIONS_TEXT = {
  title: 'Mission control',
  intro: 'Heroes on active duty and what they have delivered. Example data for demonstration.',
  deployed: 'Deployed now',
  deployedHint: 'Heroes on active duty',
  logged: 'Missions logged',
  loggedHint: 'Across deployed heroes',
  success: 'Success rate',
  successHint: 'Weighted by missions',
  listTitle: 'Active deployments',
  missions: 'missions',
  won: 'success',
  empty: 'No heroes are on active duty. Deploy one from its detail screen.',
} as const;

/**
 * Missions state: who is deployed right now, and the totals across them. Derived from the shared
 * roster, so a deploy or retire on another screen shows up here without a refresh.
 */
@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);

  readonly text = MISSIONS_TEXT;

  readonly deployed = computed(() => this.heroService.heroes().filter((hero) => hero.active));
  readonly deployedCount = computed(() => this.deployed().length);
  readonly missionsLogged = computed(() => this.deployed().reduce((sum, hero) => sum + hero.missions, 0));

  readonly successRate = computed(() => {
    const total = this.missionsLogged();
    if (total === 0) return 0;
    const won = this.deployed().reduce((sum, hero) => sum + Math.round((hero.missions * hero.successRate) / 100), 0);
    return Math.round((won / total) * 100);
  });
}
