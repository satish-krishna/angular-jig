import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import type { Hero, PowerClass } from '../domain/hero.model';
import { POWER_CLASSES } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';

/** Sentinel for the class filter's "no restriction" option. */
export const ALL_CLASSES = 'all';

export type ClassFilter = typeof ALL_CLASSES | PowerClass;

/** Component-scoped ViewModel for the Roster screen: the filter bar state and the table rows it yields. */
@Injectable()
export class RosterViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  /** Roster count, for the footer. */
  readonly total = this._heroes.count;

  /** The `q` query parameter, which the topbar search sets. Read as a stream so a reused component follows it. */
  private readonly _queryParam = toSignal(this._route.queryParamMap.pipe(map((params) => params.get('q') ?? '')), {
    initialValue: this._route.snapshot.queryParamMap.get('q') ?? '',
  });

  /** The search box text. Matches name, alias and ID, case-insensitively. Follows the topbar search. */
  readonly query = linkedSignal(() => this._queryParam());

  /** The class filter. ALL_CLASSES shows every class. */
  readonly classFilter = signal<ClassFilter>(ALL_CLASSES);

  /** Class filter options, in the order the select shows them. */
  readonly classOptions: readonly ClassFilter[] = [ALL_CLASSES, ...POWER_CLASSES];

  /** Heroes that pass both filters, highest power first. Ties keep roster order. */
  readonly rows = computed<readonly Hero[]>(() => {
    const term = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this._heroes
      .roster()
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter((hero) => !term || [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(term)))
      .slice()
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  /** How many heroes the table is showing, for the footer. */
  readonly shownCount = computed(() => this.rows().length);

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** The select can emit null when its selection is cleared; that means no class restriction. */
  setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? ALL_CLASSES);
  }

  /** The text a class option shows in the select. */
  optionLabel(option: ClassFilter): string {
    return option === ALL_CLASSES ? 'All classes' : option;
  }

  /** Opens the dossier for a hero. */
  openHero(hero: Hero): void {
    void this._router.navigate(['/detail', hero.id]);
  }
}
