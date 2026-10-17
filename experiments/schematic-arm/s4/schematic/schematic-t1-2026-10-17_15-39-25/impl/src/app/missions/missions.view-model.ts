import { Injectable, computed, inject } from '@angular/core';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { HeroService } from '../domain/hero.service';
import { heroCode, initialsOf, missionRecord } from '../domain/hero-display';
import type { StatIcon } from '../ui/stat-tile/stat-tile';

export interface MissionRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly initials: string;
  readonly missions: number;
  readonly wins: number;
  readonly losses: number;
  readonly successRate: number;
  readonly result: string;
  readonly resultVariant: BadgeVariants['variant'];
}

export interface MissionStat {
  readonly label: string;
  readonly value: number | string;
  readonly hint: string;
  readonly icon: StatIcon;
}

// A hero's result band, read off the success rate the roster records.
function resultOf(successRate: number): Pick<MissionRow, 'result' | 'resultVariant'> {
  if (successRate >= 90) {
    return { result: 'Strong', resultVariant: 'success' };
  }
  if (successRate >= 80) {
    return { result: 'Steady', resultVariant: 'secondary' };
  }
  return { result: 'Watch', resultVariant: 'warning' };
}

// The mission log: every hero's deployment record, read from the shared roster. Component-scoped, no DOM.
@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService).heroes;

  // Busiest first, so the table reads as a deployment ledger.
  readonly rows = computed<readonly MissionRow[]>(() =>
    [...this.heroes()]
      .sort((a, b) => b.missions - a.missions)
      .map((hero) => {
        const { wins, losses } = missionRecord(hero);
        return {
          id: hero.id,
          code: heroCode(hero.id),
          name: hero.name,
          initials: initialsOf(hero.name),
          missions: hero.missions,
          wins,
          losses,
          successRate: hero.successRate,
          ...resultOf(hero.successRate),
        };
      }),
  );

  readonly stats = computed<readonly MissionStat[]>(() => {
    const rows = this.rows();
    const missions = rows.reduce((sum, row) => sum + row.missions, 0);
    const wins = rows.reduce((sum, row) => sum + row.wins, 0);
    const losses = rows.reduce((sum, row) => sum + row.losses, 0);
    const overall = missions ? Math.round((wins / missions) * 100) : 0;
    const best = rows
      .filter((row) => row.missions > 0)
      .reduce<MissionRow | undefined>(
        (top, row) => (!top || row.successRate > top.successRate ? row : top),
        undefined,
      );
    return [
      { label: 'Missions logged', value: missions, hint: 'Across the roster', icon: 'lucideActivity' },
      { label: 'Overall success', value: `${overall}%`, hint: 'Weighted by missions', icon: 'lucideZap' },
      { label: 'Failed missions', value: losses, hint: 'Logged as unsuccessful', icon: 'lucideShieldAlert' },
      {
        label: 'Top record',
        value: best?.name ?? 'None yet',
        hint: best ? `${best.successRate}% over ${best.missions} missions` : 'No missions logged',
        icon: 'lucideUserCheck',
      },
    ];
  });
}
