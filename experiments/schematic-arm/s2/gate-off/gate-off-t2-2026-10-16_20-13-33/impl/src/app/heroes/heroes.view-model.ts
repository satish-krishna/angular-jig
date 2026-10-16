import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { initialsOf, statusTone, type StatusTone } from '../domain/hero.presentation';

/** The class filter's value: one power class, or `all` for no class filter. */
export type ClassFilter = PowerClass | 'all';

/** One roster row: the hero plus the presentation derived from it. */
export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusTone: StatusTone;
}

/** The roster's state: the search text, the class filter, and the filtered, power-sorted rows. Component-scoped. */
@Injectable()
export class HeroesViewModel {
  private readonly heroes = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  /** The `q` the shell's search sends with the roster route. Read through the param stream, so a reused screen follows it. */
  private readonly routeQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  /** The search text. It starts from the shell's search, then follows what the operator types. */
  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>('all');

  /** The class filter's options, with "all" first. */
  readonly classOptions: readonly ClassFilter[] = ['all', ...POWER_CLASSES];

  /** Readable label for a class option. Also the select's item-to-string, so the trigger shows the label. */
  readonly classLabel = (value: ClassFilter): string => (value === 'all' ? 'All classes' : value);

  /** The heroes that pass both filters, strongest first. */
  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this.heroes
      .heroes()
      .filter((hero) => powerClass === 'all' || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          needle === '' ||
          [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({
        hero,
        initials: initialsOf(hero.name),
        statusTone: statusTone(hero.status),
      }));
  });

  /** Footer count, for example "3 of 12 heroes". */
  readonly summary = computed(
    () => `${this.rows().length} of ${this.heroes.heroes().length} heroes`,
  );

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** A cleared select (null or undefined) means no class filter. */
  setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? 'all');
  }
}
