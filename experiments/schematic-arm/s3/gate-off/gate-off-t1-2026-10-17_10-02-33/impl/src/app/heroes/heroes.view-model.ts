import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type PowerClass } from '../domain/hero.model';
import { rosterRow, type RosterRow } from '../ui/roster-table';

export const ALL_CLASSES = 'All';
export type ClassFilter = PowerClass | typeof ALL_CLASSES;

// The roster's filter state and derived rows, with no DOM. Component-scoped: the Heroes component provides it.
@Injectable()
export class HeroesViewModel {
  private readonly heroService = inject(HeroService);
  private readonly route = inject(ActivatedRoute);
  private readonly roster = this.heroService.heroes;

  readonly classOptions: readonly ClassFilter[] = [ALL_CLASSES, ...POWER_CLASSES];

  // The topbar search opens this screen with ?q=. The query follows the URL, and typing overrides it until the URL changes.
  private readonly routeQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: this.route.snapshot.queryParamMap.get('q') ?? '' },
  );
  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>(ALL_CLASSES);

  private readonly rosterCount = computed(() => this.roster().length);

  // Strongest first, so the table reads in the order the footer promises.
  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();

    return this.roster()
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          !needle || [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map(rosterRow);
  });

  readonly summary = computed(() => `${this.rows().length} of ${this.rosterCount()} heroes`);

  setQuery(value: string): void {
    this.query.set(value);
  }

  // The select reports nothing when its selection is cleared, and an empty filter means "all classes".
  setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? ALL_CLASSES);
  }
}
