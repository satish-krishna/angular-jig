import { computed, inject, Injectable, signal } from '@angular/core';
import { canDeploy } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { toHeroRow, type HeroRow } from '../ui/hero-display';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

export interface MissionStat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon: StatIcon;
}

export interface MissionRow extends HeroRow {
  readonly canDeploy: boolean;
}

@Injectable() // no providedIn: scoped to the Missions component that provides it
export class MissionsViewModel {
  private readonly heroService = inject(HeroService);

  readonly notice = signal('');

  // Derived from the roster, so a deployment from here or from a detail screen shows on both.
  readonly stats = computed<readonly MissionStat[]>(() => {
    const list = this.heroService.list();
    const missions = list.reduce((sum, hero) => sum + hero.missionCount, 0);
    const inField = list.filter((hero) => hero.status === 'Active').length;
    const withRecord = list.filter((hero) => hero.missionCount > 0);
    const averageSuccess = withRecord.length
      ? Math.round(withRecord.reduce((sum, hero) => sum + hero.successRate, 0) / withRecord.length)
      : 0;

    return [
      { id: 'missions', label: 'Missions on record', value: String(missions), detail: 'Across the roster', icon: 'lucideActivity' },
      { id: 'field', label: 'Heroes in the field', value: String(inField), detail: 'Status Active', icon: 'lucideUserCheck' },
      { id: 'success', label: 'Average success', value: `${averageSuccess}%`, detail: 'Mean of each hero rate', icon: 'lucideZap' },
    ];
  });

  // The field units, most missions on record first.
  readonly rows = computed<readonly MissionRow[]>(() =>
    [...this.heroService.list()]
      .sort((a, b) => b.missionCount - a.missionCount)
      .map((hero) => ({ ...toHeroRow(hero), canDeploy: canDeploy(hero.status) })),
  );

  deploy(id: string): void {
    const hero = this.heroService.deploy(id);
    if (hero) this.notice.set(`${hero.name} is deployed.`);
  }
}
