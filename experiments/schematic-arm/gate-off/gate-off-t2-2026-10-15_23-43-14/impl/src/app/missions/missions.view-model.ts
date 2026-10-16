import { Injectable, computed, inject } from '@angular/core';
import { missionRecord, type Hero } from '../domain/hero';
import { HeroService } from '../domain/hero.service';

/** One hero's mission record: the hero plus the missions won and lost. */
export interface MissionRow {
  readonly hero: Hero;
  readonly won: number;
  readonly lost: number;
}

/**
 * State for the missions screen: each hero's mission record and the totals across the roster.
 * Derived from the shared roster, so a change made on the detail screen shows here at once.
 */
@Injectable()
export class MissionsViewModel {
  private readonly _heroes = inject(HeroService);

  /** Heroes with the most missions first. */
  public readonly rows = computed<readonly MissionRow[]>(() =>
    this._heroes
      .roster()
      .map((hero) => ({ hero, ...missionRecord(hero) }))
      .sort((a, b) => b.hero.missionCount - a.hero.missionCount),
  );

  public readonly missionTotal = computed(() =>
    this.rows().reduce((sum, row) => sum + row.hero.missionCount, 0),
  );

  public readonly wonTotal = computed(() => this.rows().reduce((sum, row) => sum + row.won, 0));

  public readonly lostTotal = computed(() => this.rows().reduce((sum, row) => sum + row.lost, 0));
}
