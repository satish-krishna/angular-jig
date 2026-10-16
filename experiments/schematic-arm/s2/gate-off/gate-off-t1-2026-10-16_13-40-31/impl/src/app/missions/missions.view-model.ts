import { Injectable, computed, inject, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import {
  MISSION_RESULT_VARIANTS,
  MISSION_RESULTS,
  type MissionBadgeVariant,
  type MissionResult,
} from '../domain/mission.model';

/** The result-filter value that shows every mission. */
export const ALL_RESULTS = 'all';
export type ResultFilter = MissionResult | typeof ALL_RESULTS;

/** One mission-log row, joined to the hero it belongs to. */
export interface MissionRow {
  readonly id: string;
  readonly title: string;
  readonly result: MissionResult;
  readonly variant: MissionBadgeVariant;
  readonly heroId: string;
  /** Null once the hero has been retired from the roster. */
  readonly heroName: string | null;
}

/** Filters the mission log for the mission board. Component-scoped; no DOM. */
@Injectable()
export class MissionsViewModel {
  private readonly heroes = inject(HeroService);

  readonly resultOptions = MISSION_RESULTS;
  readonly resultFilter = signal<ResultFilter>(ALL_RESULTS);

  private readonly names = computed(
    () => new Map(this.heroes.list().map((hero) => [hero.id, hero.name])),
  );

  /** Newest deployments first, optionally narrowed to one result. */
  readonly rows = computed<readonly MissionRow[]>(() => {
    const wanted = this.resultFilter();
    const names = this.names();
    return this.heroes
      .missions()
      .filter((mission) => wanted === ALL_RESULTS || mission.result === wanted)
      .slice()
      .reverse()
      .map((mission) => ({
        id: mission.id,
        title: mission.title,
        result: mission.result,
        variant: MISSION_RESULT_VARIANTS[mission.result],
        heroId: mission.heroId,
        heroName: names.get(mission.heroId) ?? null,
      }));
  });

  readonly total = computed(() => this.heroes.missions().length);

  readonly inFieldCount = computed(
    () => this.heroes.missions().filter((mission) => mission.result === 'In field').length,
  );

  /** Share of resolved missions that finished as a clean success. */
  readonly successRate = computed(() => {
    const resolved = this.heroes.missions().filter((mission) => mission.result !== 'In field');
    if (resolved.length === 0) return 0;
    const successes = resolved.filter((mission) => mission.result === 'Success').length;
    return Math.round((successes / resolved.length) * 100);
  });

  setResultFilter(value: ResultFilter | null | undefined): void {
    this.resultFilter.set(value ?? ALL_RESULTS);
  }
}
