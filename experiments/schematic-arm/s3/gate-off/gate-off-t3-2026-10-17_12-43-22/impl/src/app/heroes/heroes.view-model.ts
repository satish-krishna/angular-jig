import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { map } from 'rxjs';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { heroInitials, STATUS_VARIANT } from '../ui/hero-card/hero-card';

type BadgeVariant = NonNullable<BadgeVariants['variant']>;

export const ALL_CLASSES = 'all';
export type ClassFilter = PowerClass | typeof ALL_CLASSES;

export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: BadgeVariant;
}

export interface ClassOption {
  readonly value: ClassFilter;
  readonly label: string;
}

// The class filter's value comes back from the select as unknown, so narrow it here.
function isClassFilter(value: unknown): value is ClassFilter {
  return value === ALL_CLASSES || POWER_CLASSES.some((powerClass) => powerClass === value);
}

// Component-scoped: the roster provides it, so each visit starts with an empty filter.
@Injectable()
export class RosterViewModel {
  private readonly _heroes = inject(HeroService).heroes;

  private readonly _route = inject(ActivatedRoute);

  // The topbar search lands here as ?q=, so a search from any screen filters the roster.
  private readonly _routeQuery = toSignal(
    this._route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  private readonly _query = linkedSignal(() => this._routeQuery());
  private readonly _classFilter = signal<ClassFilter>(ALL_CLASSES);

  public readonly query = this._query.asReadonly();
  public readonly classFilter = this._classFilter.asReadonly();

  public readonly classOptions: readonly ClassOption[] = [
    { value: ALL_CLASSES, label: 'All classes' },
    ...POWER_CLASSES.map((powerClass) => ({ value: powerClass, label: powerClass })),
  ];

  public readonly totalCount = computed(() => this._heroes().length);

  // Sorted by power, strongest first, so the summary footer's "sorted by power" holds.
  public readonly rows = computed<RosterRow[]>(() => {
    const query = this._query().trim().toLowerCase();
    const powerClass = this._classFilter();

    return this._heroes()
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          query === '' ||
          [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(query)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({
        hero,
        initials: heroInitials(hero.name),
        statusVariant: STATUS_VARIANT[hero.status],
      }));
  });

  public readonly visibleCount = computed(() => this.rows().length);

  public setQuery(value: string): void {
    this._query.set(value);
  }

  public setClassFilter(value: unknown): void {
    if (isClassFilter(value)) {
      this._classFilter.set(value);
    }
  }
}
