import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { POWER_CLASSES, type PowerClass } from '../domain/hero.model';
import { toRosterRow, type RosterRow } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';

export type ClassFilter = PowerClass | 'all';

export interface ClassOption {
  readonly value: ClassFilter;
  readonly label: string;
}

function isClassFilter(value: unknown): value is ClassFilter {
  return value === 'all' || (POWER_CLASSES as readonly unknown[]).includes(value);
}

/**
 * Roster state: the search query, the class filter, and the filtered rows sorted by power.
 * The query can arrive from the top-bar search as `?q=`, so a search lands on a filtered roster.
 */
@Injectable()
export class RosterViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly queryParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  /** Follows the `?q=` parameter; typing in the roster search overrides it until the parameter changes. */
  readonly query = linkedSignal(() => this.queryParam());
  readonly classFilter = signal<ClassFilter>('all');

  readonly classOptions: readonly ClassOption[] = [
    { value: 'all', label: 'All classes' },
    ...POWER_CLASSES.map((value) => ({ value, label: value })),
  ];

  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this.heroes
      .heroes()
      .filter((hero) => powerClass === 'all' || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          !needle || [hero.name, hero.alias, hero.id].some((text) => text.toLowerCase().includes(needle)),
      )
      .map(toRosterRow)
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  readonly totalCount = computed(() => this.heroes.heroes().length);
  readonly shownCount = computed(() => this.rows().length);

  setQuery(value: string): void {
    this.query.set(value);
  }

  setClassFilter(value: unknown): void {
    if (isClassFilter(value)) this.classFilter.set(value);
  }

  openDossier(id: string): void {
    void this.router.navigate(['/detail', id]);
  }
}
