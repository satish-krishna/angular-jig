import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type PowerClass } from '../domain/hero.model';
import { toRosterRows, type RosterRow } from '../ui/hero-presentation';

export const ALL_CLASSES = 'All classes';
export type ClassFilter = PowerClass | typeof ALL_CLASSES;

function isClassFilter(value: unknown): value is ClassFilter {
  return value === ALL_CLASSES || (POWER_CLASSES as readonly unknown[]).includes(value);
}

// Component-scoped: provided by Heroes, so each visit starts with an empty class filter.
@Injectable()
export class HeroesViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  readonly classOptions: readonly ClassFilter[] = [ALL_CLASSES, ...POWER_CLASSES];

  /** The top-bar search lands here as `?q=`. Read through the route stream so a reused component follows it. */
  private readonly urlQuery = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')), {
    initialValue: '',
  });

  /** The search box text. Starts from the URL and can be typed over. */
  readonly query = linkedSignal(() => this.urlQuery());
  readonly classFilter = linkedSignal<ClassFilter>(() => ALL_CLASSES);

  readonly totalCount = computed(() => this.heroService.heroes().length);

  /** Filtered by class and by a case-insensitive match on name, alias, or roster id; highest power first. */
  readonly rows = computed<readonly RosterRow[]>(() => {
    const query = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();

    return toRosterRows(
      this.heroService
        .heroes()
        .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
        .filter((hero) => query === '' || [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(query))),
    );
  });

  readonly visibleCount = computed(() => this.rows().length);

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** The select emits its value untyped, so anything outside the known filters is ignored. */
  setClassFilter(value: unknown): void {
    if (isClassFilter(value)) this.classFilter.set(value);
  }
}
