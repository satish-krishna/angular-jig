import { Injectable, computed, inject, signal } from '@angular/core';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { HERO_STATUS_BADGE, initialsOf, type StatusBadge } from '../ui/hero-format';
import type { StatFigure } from '../ui/stat-tile';

/** A roster row for the missions board: the record, its badge and initials, and whether it can deploy now. */
export interface MissionRow extends Hero {
  readonly initials: string;
  readonly statusVariant: StatusBadge;
  readonly canDeploy: boolean;
}

// Owns the missions board: the per-hero mission record, the team figures, and the deploy action.
// Component-scoped (provided by Missions), so no providedIn.
@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService);

  /** Feedback line after a deployment. Read by a polite live region. */
  readonly notice = signal('');

  /** The whole roster, most missions first. Only Active heroes can be deployed. */
  readonly rows = computed<readonly MissionRow[]>(() =>
    [...this.heroes.list()]
      .sort((a, b) => b.missions - a.missions || a.name.localeCompare(b.name))
      .map((hero) => ({
        ...hero,
        initials: initialsOf(hero.name),
        statusVariant: HERO_STATUS_BADGE[hero.status],
        canDeploy: hero.status === 'Active',
      })),
  );

  private readonly totalMissions = computed(() =>
    this.heroes.list().reduce((sum, hero) => sum + hero.missions, 0),
  );

  /** Team success rate, weighted by each hero's mission count. */
  private readonly teamSuccess = computed(() => {
    const total = this.totalMissions();
    if (total === 0) {
      return 0;
    }
    const successes = this.heroes
      .list()
      .reduce((sum, hero) => sum + (hero.missions * hero.successRate) / 100, 0);
    return Math.round((successes / total) * 100);
  });

  readonly stats = computed<readonly StatFigure[]>(() => [
    {
      label: 'Ready to deploy',
      value: this.heroes.list().filter((hero) => hero.status === 'Active').length,
      hint: 'Active heroes',
      icon: 'lucideUserCheck',
    },
    {
      label: 'Missions on record',
      value: this.totalMissions(),
      hint: 'Across the roster',
      icon: 'lucideActivity',
    },
    {
      label: 'Team success',
      value: `${this.teamSuccess()}%`,
      hint: 'Weighted by mission count',
      icon: 'lucideZap',
    },
  ]);

  deploy(hero: MissionRow): void {
    const updated = this.heroes.deploy(hero.id);
    if (updated) {
      this.notice.set(`${updated.name} deployed. Mission count updated.`);
    }
  }
}
