import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Hero } from '../domain/hero.model';
import { toRosterRow, type RosterRow } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';
import { MissionService } from '../domain/mission.service';
import { ThreatService } from '../domain/threat.service';
import type { StatFigure } from '../ui/stat-tile/stat-tile';

const TOP_HERO_COUNT = 4;

/**
 * Dashboard state: headline figures, the top heroes by power, the roster table, and
 * navigation to a dossier. Every figure is read from the shared services, so an edit
 * on a dossier shows up here on the next change.
 */
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);
  private readonly missions = inject(MissionService);
  private readonly threats = inject(ThreatService);
  private readonly router = inject(Router);

  readonly rosterCount = computed(() => this.heroes.heroes().length);

  private readonly activeCount = computed(
    () => this.heroes.heroes().filter((hero) => hero.status === 'Active').length,
  );

  private readonly averagePower = computed(() => {
    const roster = this.heroes.heroes();
    if (roster.length === 0) return 0;
    const total = roster.reduce((sum, hero) => sum + hero.powerIndex, 0);
    return Math.round(total / roster.length);
  });

  readonly stats = computed<readonly StatFigure[]>(() => [
    {
      label: 'Heroes on roster',
      value: String(this.rosterCount()),
      detail: `${this.activeCount()} active`,
      icon: 'lucideUserCheck',
    },
    {
      label: 'Missions live',
      value: String(this.missions.live().length),
      detail: 'Heroes in the field',
      icon: 'lucideActivity',
    },
    {
      label: 'Average power',
      value: String(this.averagePower()),
      detail: 'Power index, 0 to 100',
      icon: 'lucideZap',
    },
    {
      label: 'Open threats',
      value: String(this.threats.openCount()),
      detail: 'Not yet contained',
      icon: 'lucideShieldAlert',
    },
  ]);

  readonly topHeroes = computed<readonly Hero[]>(() =>
    [...this.heroes.heroes()]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .slice(0, TOP_HERO_COUNT),
  );

  /** The full roster, strongest first, shaped for the dashboard table. */
  readonly rosterRows = computed<readonly RosterRow[]>(() =>
    this.heroes
      .heroes()
      .map(toRosterRow)
      .sort((a, b) => b.powerIndex - a.powerIndex),
  );

  openDossier(hero: Hero): void {
    void this.router.navigate(['/detail', hero.id]);
  }
}
