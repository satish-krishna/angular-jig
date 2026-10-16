import { computed, inject, Injectable } from '@angular/core';
import { toRosterRow, type RosterRow } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import type { StatFigure } from '../ui/stat-tile/stat-tile';

/** One live mission, shaped for the table. The hero is named, not just identified. */
export interface LiveMissionRow {
  readonly id: string;
  readonly codename: string;
  readonly district: string;
  readonly objective: string;
  readonly heroName: string;
}

/**
 * Missions state: the live deployments, the heroes ready to be sent out, and the headline
 * figures. Deploy and stand-down go through the shared mission service, so the dashboard
 * and the dossiers see each change.
 */
@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);

  readonly liveMissions = computed<readonly LiveMissionRow[]>(() =>
    this.missions.live().map((mission) => ({
      id: mission.id,
      codename: mission.codename,
      district: mission.district,
      objective: mission.objective,
      heroName: this.heroes.byId(mission.heroId)?.name ?? mission.heroId,
    })),
  );

  /** Active heroes who are not already in the field, strongest first. */
  readonly readyHeroes = computed<readonly RosterRow[]>(() =>
    this.heroes
      .heroes()
      .filter((hero) => this.missions.canDeploy(hero))
      .map(toRosterRow)
      .sort((a, b) => b.powerIndex - a.powerIndex),
  );

  readonly stats = computed<readonly StatFigure[]>(() => [
    {
      label: 'Live missions',
      value: String(this.liveMissions().length),
      detail: 'Heroes in the field',
      icon: 'lucideActivity',
    },
    {
      label: 'Ready to deploy',
      value: String(this.readyHeroes().length),
      detail: 'Active and not in the field',
      icon: 'lucideUserCheck',
    },
    {
      label: 'Missions logged',
      value: String(this.heroes.heroes().reduce((sum, hero) => sum + hero.missionCount, 0)),
      detail: 'Totals across the roster',
      icon: 'lucideZap',
    },
  ]);

  deploy(heroId: string): void {
    this.missions.deploy(heroId);
  }

  standDown(missionId: string): void {
    this.missions.standDown(missionId);
  }
}
