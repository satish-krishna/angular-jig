import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { Hero } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';

/** How many hero cards the "top heroes this cycle" grid shows. */
const TOP_HERO_COUNT = 4;

/** Component-scoped ViewModel for the Operations Dashboard. All figures derive from the roster. */
@Injectable()
export class DashboardViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);

  /** Roster count, for the stat tile and the roster heading. */
  readonly heroCount = this._heroes.count;

  readonly missionsOnRecord = computed(() =>
    this._heroes.roster().reduce((total, hero) => total + hero.missionCount, 0),
  );

  /** Mean power index, rounded to a whole number. Zero for an empty roster. */
  readonly averagePower = computed(() => {
    const roster = this._heroes.roster();
    if (roster.length === 0) return 0;
    const sum = roster.reduce((total, hero) => total + hero.powerIndex, 0);
    return Math.round(sum / roster.length);
  });

  /** Heroes not on Active duty: Injured, Reserve or MIA. */
  readonly offDuty = computed(() => this._heroes.roster().filter((hero) => hero.status !== 'Active').length);

  /** The whole roster, highest power index first. Ties keep roster order. */
  readonly roster = computed<readonly Hero[]>(() => [...this._heroes.roster()].sort((a, b) => b.powerIndex - a.powerIndex));

  /** The top of the roster, for the hero cards. */
  readonly topHeroes = computed<readonly Hero[]>(() => this.roster().slice(0, TOP_HERO_COUNT));

  /** Opens the dossier for a hero. */
  openHero(hero: Hero): void {
    void this._router.navigate(['/detail', hero.id]);
  }
}
