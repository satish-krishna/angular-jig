import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { heroRow, type HeroRow } from '../ui/hero-presentation';

/** How many heroes the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

/**
 * State for the operations dashboard: the headline figures, the top heroes, and the roster
 * table, all derived from the roster. Component-scoped, so each visit gets its own instance.
 */
@Injectable()
export class DashboardViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _roster = this._heroes.roster;

  public readonly total = computed(() => this._roster().length);

  public readonly activeCount = computed(
    () => this._roster().filter((hero) => hero.status === 'Active').length,
  );

  /** Injured or missing: the heroes not available for deployment. */
  public readonly offDutyCount = computed(
    () => this._roster().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA').length,
  );

  public readonly missionCount = computed(() =>
    this._roster().reduce((sum, hero) => sum + hero.missionCount, 0),
  );

  public readonly averagePower = computed(() => {
    const total = this.total();
    if (total === 0) return 0;
    const sum = this._roster().reduce((acc, hero) => acc + hero.powerIndex, 0);
    return Math.round(sum / total);
  });

  /** The whole roster, strongest first. Both the top heroes and the roster table read from it. */
  private readonly _ranked = computed(() =>
    [...this._roster()].sort((a, b) => b.powerIndex - a.powerIndex),
  );

  public readonly topHeroes = computed(() => this._ranked().slice(0, TOP_HERO_COUNT));

  public readonly rosterRows = computed<readonly HeroRow[]>(() => this._ranked().map(heroRow));
}
