import { computed, inject, Injectable } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { Hero } from '../domain/hero.model';
import { toRosterRow } from '../ui/hero-presentation';
import type { RosterRow } from '../ui/hero-presentation';

export interface DashboardStat {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon: string;
}

const TOP_HERO_COUNT = 4;

function mean(values: readonly number[]): number {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

/** The roster strongest first. A copy is sorted, so the roster signal is never mutated. */
function byPower(heroes: readonly Hero[]): Hero[] {
  return [...heroes].sort((a, b) => b.powerIndex - a.powerIndex);
}

/** Component-scoped: the dashboard provides it, so each visit starts a fresh view of the roster. */
@Injectable()
export class DashboardViewModel {
  private readonly heroes = inject(HeroService);
  private readonly roster = this.heroes.roster;

  readonly rosterCount = computed(() => this.roster().length);

  /** The strongest heroes by power index. */
  readonly topHeroes = computed<readonly Hero[]>(() => byPower(this.roster()).slice(0, TOP_HERO_COUNT));

  /** The whole roster as table rows, strongest first. */
  readonly rosterRows = computed<readonly RosterRow[]>(() => byPower(this.roster()).map(toRosterRow));

  readonly stats = computed<readonly DashboardStat[]>(() => {
    const roster = this.roster();
    const active = roster.filter((hero) => hero.status === 'Active').length;
    const alerts = roster.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;
    const missions = roster.reduce((sum, hero) => sum + hero.missionCount, 0);

    return [
      { label: 'Heroes on roster', value: String(roster.length), detail: `${active} active`, icon: 'lucideUserCheck' },
      {
        label: 'Missions on record',
        value: String(missions),
        detail: `${mean(roster.map((hero) => hero.successRate))}% average success`,
        icon: 'lucideActivity',
      },
      {
        label: 'Average power',
        value: String(mean(roster.map((hero) => hero.powerIndex))),
        detail: 'Power index, out of 100',
        icon: 'lucideZap',
      },
      { label: 'Status alerts', value: String(alerts), detail: 'Injured or MIA', icon: 'lucideShieldAlert' },
    ];
  });
}
