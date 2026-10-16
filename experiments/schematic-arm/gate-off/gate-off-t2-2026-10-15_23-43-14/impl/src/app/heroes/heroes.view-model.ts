import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { POWER_CLASSES, type PowerClass } from '../domain/hero';
import { HeroService } from '../domain/hero.service';
import { heroRow, type HeroRow } from '../ui/hero-presentation';

const ALL_CLASSES = 'all';
type ClassFilter = typeof ALL_CLASSES | PowerClass;

/**
 * State for the roster screen: the search text and class filter, and the filtered rows sorted
 * by power. The search text starts from the `q` query parameter, so the top-bar search can open
 * the roster already filtered. Component-scoped, so each visit starts with a fresh class filter.
 */
@Injectable()
export class RosterViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _route = inject(ActivatedRoute);

  /** The `q` parameter as a stream, so a new search reaches a roster already on screen. */
  private readonly _queryParam = toSignal(
    this._route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  public readonly query = linkedSignal(() => this._queryParam());
  public readonly classFilter = signal<ClassFilter>(ALL_CLASSES);

  public readonly classOptions: readonly { value: ClassFilter; label: string }[] = [
    { value: ALL_CLASSES, label: 'All classes' },
    ...POWER_CLASSES.map((powerClass) => ({ value: powerClass, label: powerClass })),
  ];

  public readonly total = computed(() => this._heroes.roster().length);

  public readonly rows = computed<readonly HeroRow[]>(() => {
    const query = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();

    return this._heroes
      .roster()
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          query === '' ||
          hero.name.toLowerCase().includes(query) ||
          hero.alias.toLowerCase().includes(query),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map(heroRow);
  });

  public readonly visibleCount = computed(() => this.rows().length);

  public setQuery(query: string): void {
    this.query.set(query);
  }

  /** Accepts only a value from the class options; anything else leaves the filter unchanged. */
  public setClassFilter(value: string | null | undefined): void {
    const option = this.classOptions.find((candidate) => candidate.value === value);
    if (option) {
      this.classFilter.set(option.value);
    }
  }
}
