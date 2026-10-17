import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Hero } from '../domain/hero.model';
import { type HeroStatusVariant, STATUS_VARIANT } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';
import type { StatIconName, StatTone } from '../ui/stat-tile/stat-tile';

export interface DashboardStat {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly icon: StatIconName;
  readonly tone: StatTone;
}

export interface DashboardRosterRow {
  readonly hero: Hero;
  readonly statusVariant: HeroStatusVariant;
}

const TOP_HERO_COUNT = 4;

// Dashboard state and logic. Component-scoped: the component provides it, so each visit starts fresh.
@Injectable()
export class DashboardViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);

  public readonly heroCount = this._heroes.count;

  // The strongest heroes by power index. "This cycle" is the example roster's framing, not a measured period.
  public readonly topHeroes = computed<readonly Hero[]>(() =>
    this._byPower().slice(0, TOP_HERO_COUNT),
  );

  // The whole roster, strongest first, for the table below the top heroes.
  public readonly roster = computed<readonly DashboardRosterRow[]>(() =>
    this._byPower().map((hero) => ({ hero, statusVariant: STATUS_VARIANT[hero.status] })),
  );

  public readonly stats = computed<readonly DashboardStat[]>(() => {
    const roster = this._heroes.heroes();
    const active = roster.filter((hero) => hero.status === 'Active').length;
    const offMission = roster.filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length;
    const missions = roster.reduce((sum, hero) => sum + hero.missionCount, 0);
    const averagePower = roster.length
      ? Math.round(roster.reduce((sum, hero) => sum + hero.powerIndex, 0) / roster.length)
      : 0;

    return [
      { label: 'Heroes on roster', value: String(roster.length), hint: `${active} active`, icon: 'lucideUserCheck', tone: 'success' },
      { label: 'Missions logged', value: String(missions), hint: 'Across the roster', icon: 'lucideActivity', tone: 'muted' },
      { label: 'Average power', value: String(averagePower), hint: 'Power index, 0 to 100', icon: 'lucideZap', tone: 'primary' },
      { label: 'Off mission', value: String(offMission), hint: 'Injured or MIA', icon: 'lucideShieldAlert', tone: 'warning' },
    ];
  });

  public openHero(hero: Hero): void {
    void this._router.navigate(['/detail', hero.id]);
  }

  private _byPower(): Hero[] {
    return [...this._heroes.heroes()].sort((a, b) => b.powerIndex - a.powerIndex);
  }
}
