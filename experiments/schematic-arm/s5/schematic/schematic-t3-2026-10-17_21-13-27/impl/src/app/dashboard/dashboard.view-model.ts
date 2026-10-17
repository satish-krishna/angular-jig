import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../hero/hero.service';
import { heroStatusVariant } from '../hero/hero-presentation';
import { MissionService } from '../mission/mission.service';
import { ThreatService } from '../threat/threat.service';

export interface DashboardStat {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly icon: string;
}

const TOP_HERO_COUNT = 4;

/** Every figure here is derived from the shared hero, mission and threat state. */
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);
  private readonly threats = inject(ThreatService);

  readonly rosterCount = computed(() => this.heroes.heroes().length);

  readonly topHeroes = computed(() =>
    [...this.heroes.heroes()].sort((a, b) => b.power - a.power).slice(0, TOP_HERO_COUNT),
  );

  /** The whole roster by codename, for the roster list under the stats. */
  readonly roster = computed(() =>
    [...this.heroes.heroes()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  readonly statusVariant = heroStatusVariant;

  readonly stats = computed<readonly DashboardStat[]>(() => {
    const roster = this.heroes.heroes();
    const active = roster.filter((hero) => hero.status === 'Active').length;
    const total = roster.reduce((sum, hero) => sum + hero.power, 0);
    const averagePower = roster.length === 0 ? 0 : Math.round(total / roster.length);

    return [
      {
        label: 'Heroes on roster',
        value: String(roster.length),
        hint: `${active} active`,
        icon: 'lucideUserCheck',
      },
      {
        label: 'Missions live',
        value: String(this.missions.live().length),
        hint: 'Open operations',
        icon: 'lucideActivity',
      },
      {
        label: 'Average power',
        value: String(averagePower),
        hint: 'Index out of 100',
        icon: 'lucideZap',
      },
      {
        label: 'Open threats',
        value: String(this.threats.open()),
        hint: `${this.threats.contained()} contained`,
        icon: 'lucideShieldAlert',
      },
    ];
  });
}
