import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { StatTileIcon } from '../ui/stat-tile/stat-tile';

export interface MissionStat {
  readonly label: string;
  readonly value: string | number;
  readonly hint: string;
  readonly icon: StatTileIcon;
}

/** Summarises mission activity across the roster. Holds no state of its own. */
@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService).heroes;

  readonly stats = computed<readonly MissionStat[]>(() => {
    const roster = this.heroes();
    const logged = roster.reduce((total, hero) => total + hero.missionCount, 0);
    const ready = roster.filter((hero) => hero.status === 'Active').length;
    const rated = roster.filter((hero) => hero.missionCount > 0);
    const totalRate = rated.reduce((total, hero) => total + hero.successRate, 0);
    const averageRate = rated.length === 0 ? 0 : Math.round(totalRate / rated.length);

    return [
      { label: 'Missions logged', value: logged, hint: 'Across the full roster', icon: 'lucideActivity' },
      { label: 'Ready to deploy', value: ready, hint: 'Heroes with Active status', icon: 'lucideUserCheck' },
      { label: 'Average success', value: `${averageRate}%`, hint: 'Heroes with a mission record', icon: 'lucideTarget' },
    ];
  });

  /** The deployable pool: Active heroes, best success rate first. */
  readonly deployable = computed(() =>
    this.heroes()
      .filter((hero) => hero.status === 'Active')
      .sort((a, b) => b.successRate - a.successRate || b.missionCount - a.missionCount),
  );
}
