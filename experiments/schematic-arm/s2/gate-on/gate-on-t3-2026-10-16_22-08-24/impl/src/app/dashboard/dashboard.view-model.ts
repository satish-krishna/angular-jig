import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero.model';
import { initialsOf, STATUS_BADGE, type BadgeVariant } from '../ui/hero-badges';
import type { StatTileIcon } from '../ui/stat-tile/stat-tile';

/** How many heroes the "top heroes this cycle" row shows. */
const TOP_HEROES_COUNT = 4;

export interface DashboardStat {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly icon: StatTileIcon;
}

export interface DashboardRosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: BadgeVariant;
}

@Injectable()
export class DashboardViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  private readonly heroes = this.heroService.heroes;

  /** Heroes on the roster, shown beside the roster heading. */
  readonly rosterCount = computed(() => this.heroes().length);

  /** The four headline figures across the top of the dashboard. */
  readonly stats = computed<readonly DashboardStat[]>(() => {
    const roster = this.heroes();
    const active = roster.filter((hero) => hero.status === 'Active').length;
    const attention = roster.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;
    const missions = roster.reduce((sum, hero) => sum + hero.missionCount, 0);
    const averagePower = roster.length
      ? Math.round(roster.reduce((sum, hero) => sum + hero.powerIndex, 0) / roster.length)
      : 0;

    return [
      { label: 'Heroes on roster', value: String(roster.length), hint: `${active} active`, icon: 'lucideUserCheck' },
      { label: 'Missions on record', value: String(missions), hint: 'Across the whole roster', icon: 'lucideActivity' },
      { label: 'Average power', value: String(averagePower), hint: 'Power index, 0 to 100', icon: 'lucideZap' },
      { label: 'Attention needed', value: String(attention), hint: 'Injured or MIA', icon: 'lucideShieldAlert' },
    ];
  });

  /** The highest power indices on the roster. Ranks a copy, so the roster signal is untouched. */
  readonly topHeroes = computed<readonly Hero[]>(() =>
    [...this.heroes()].sort((a, b) => b.powerIndex - a.powerIndex).slice(0, TOP_HEROES_COUNT),
  );

  /** The whole roster in ID order, for the table at the foot of the dashboard. */
  readonly roster = computed<readonly DashboardRosterRow[]>(() =>
    this.heroes().map((hero) => ({ hero, initials: initialsOf(hero.alias), statusVariant: STATUS_BADGE[hero.status] })),
  );

  /** Open a hero's dossier. */
  open(hero: Hero): void {
    void this.router.navigate(['/detail', hero.id]);
  }
}
