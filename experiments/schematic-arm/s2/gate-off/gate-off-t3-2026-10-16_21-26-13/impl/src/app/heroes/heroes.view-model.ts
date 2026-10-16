import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES } from '../domain/hero.model';
import type { PowerClass } from '../domain/hero.model';
import { toRosterRow } from '../ui/hero-presentation';
import type { RosterRow } from '../ui/hero-presentation';

const ALL_CLASSES = 'all';

export type ClassFilter = PowerClass | typeof ALL_CLASSES;

/** Component-scoped: the roster provides it, so each visit starts with no class filter applied. */
@Injectable()
export class RosterViewModel {
  private readonly heroes = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  // The shell search hands its term over as ?q=. Reading the query param, not the snapshot,
  // keeps the box in step when the search runs again while this screen is already open.
  private readonly routeQuery = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')), {
    initialValue: '',
  });

  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>(ALL_CLASSES);

  readonly classOptions: readonly ClassFilter[] = [ALL_CLASSES, ...POWER_CLASSES];

  /** Filtered by search text and class, then sorted by power, strongest first. */
  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const classFilter = this.classFilter();

    return this.heroes
      .roster()
      .filter((hero) => classFilter === ALL_CLASSES || hero.powerClass === classFilter)
      .filter((hero) =>
        !needle || [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map(toRosterRow);
  });

  readonly shownCount = computed(() => this.rows().length);
  readonly totalCount = computed(() => this.heroes.roster().length);

  readonly classLabel = (option: ClassFilter): string => (option === ALL_CLASSES ? 'All classes' : option);

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** The select reports no value when it is cleared; that means no class filter. */
  setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? ALL_CLASSES);
  }
}
