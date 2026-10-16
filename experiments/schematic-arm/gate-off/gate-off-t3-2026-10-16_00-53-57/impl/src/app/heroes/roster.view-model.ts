import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero';

const ALL_CLASSES = 'All';

export type ClassFilter = typeof ALL_CLASSES | PowerClass;

function isClassFilter(value: string | null | undefined): value is ClassFilter {
  return value === ALL_CLASSES || (POWER_CLASSES as readonly string[]).includes(value ?? '');
}

// Owns the roster's filter state and the filtered, sorted rows. Component-scoped, no DOM.
@Injectable()
export class RosterViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly heroes = this.heroService.heroes;

  // The topbar search lands here with `?q=`. The query follows the URL, and the filter input can still edit it.
  private readonly routeQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>(ALL_CLASSES);
  readonly classOptions: readonly ClassFilter[] = [ALL_CLASSES, ...POWER_CLASSES];

  readonly totalCount = computed(() => this.heroes().length);

  // Filters a copy, then sorts by power, highest first. The service's list is shared state and stays untouched.
  readonly rows = computed<readonly Hero[]>(() => {
    const term = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this.heroes()
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          term === '' || [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(term)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  readonly visibleCount = computed(() => this.rows().length);

  readonly summary = computed(
    () => `${this.visibleCount()} of ${this.totalCount()} heroes · sorted by power`,
  );

  readonly labelFor = (value: string): string => (value === ALL_CLASSES ? 'All classes' : value);

  setQuery(value: string): void {
    this.query.set(value);
  }

  setClassFilter(value: string | null | undefined): void {
    this.classFilter.set(isClassFilter(value) ? value : ALL_CLASSES);
  }
}
