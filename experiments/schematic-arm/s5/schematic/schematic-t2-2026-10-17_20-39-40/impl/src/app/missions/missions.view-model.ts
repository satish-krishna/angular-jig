import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { HERO_STATUS_VARIANT, isDeployable, type HeroBadgeVariant } from '../hero/hero-display';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

export interface MissionStat {
  readonly key: string;
  readonly label: string;
  readonly value: string | number;
  readonly hint: string;
  readonly icon: StatIcon;
}

export interface MissionRow {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly status: string;
  readonly statusVariant: HeroBadgeVariant;
  readonly clearance: string;
  readonly missions: number;
  readonly successRate: number;
  readonly deployable: boolean;
}

// Component-scoped (no providedIn): the Missions component provides it.
@Injectable()
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);

  readonly stats = computed<readonly MissionStat[]>(() => {
    const roster = this.heroService.heroes();
    const ready = roster.filter(isDeployable).length;
    const totalMissions = roster.reduce((sum, hero) => sum + hero.missions, 0);
    const averageSuccess = roster.length
      ? Math.round(roster.reduce((sum, hero) => sum + hero.successRate, 0) / roster.length)
      : 0;

    return [
      { key: 'ready', label: 'Ready to deploy', value: ready, hint: 'Active and on the roster', icon: 'lucideCrosshair' },
      { key: 'missions', label: 'Missions on file', value: totalMissions, hint: 'Across the roster', icon: 'lucideActivity' },
      { key: 'success', label: 'Average success', value: `${averageSuccess}%`, hint: 'Mean of each hero rate', icon: 'lucideCheck' },
    ];
  });

  /** The deployment board: most experienced heroes first. */
  readonly rows = computed<readonly MissionRow[]>(() =>
    [...this.heroService.heroes()]
      .sort((a, b) => b.missions - a.missions)
      .map((hero) => ({
        id: hero.id,
        name: hero.name,
        alias: hero.alias,
        status: hero.status,
        statusVariant: HERO_STATUS_VARIANT[hero.status],
        clearance: hero.clearance,
        missions: hero.missions,
        successRate: hero.successRate,
        deployable: isDeployable(hero),
      })),
  );
}
