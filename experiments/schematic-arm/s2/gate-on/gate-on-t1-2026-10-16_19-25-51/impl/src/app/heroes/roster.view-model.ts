import { computed, inject, Injectable, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type Hero } from '../domain/hero.model';
import { initialsOf } from '../domain/hero.initials';

/** The class filter's "no filter" option. */
export const ALL_CLASSES = 'All';
export type ClassFilter = typeof ALL_CLASSES | (typeof POWER_CLASSES)[number];

/** One table row: the hero plus the letters its avatar fallback shows. */
export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
}

/** Filters and sorts the roster for the table. Holds the filter state, nothing else. */
@Injectable()
export class RosterViewModel {
  private readonly roster = inject(HeroService).heroes;

  readonly query = signal('');
  readonly classFilter = signal<ClassFilter>(ALL_CLASSES);
  readonly classOptions: readonly ClassFilter[] = [ALL_CLASSES, ...POWER_CLASSES];

  readonly total = computed(() => this.roster().length);

  /** The heroes that pass both filters, strongest first. */
  readonly rows = computed<readonly RosterRow[]>(() => {
    const term = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();

    return [...this.roster()]
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter((hero) =>
        term === '' || [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(term)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({ hero, initials: initialsOf(hero.name) }));
  });

  readonly shown = computed(() => this.rows().length);

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** Accepts the select's emitted value and keeps it only if it is a known option. */
  setClassFilter(value: unknown): void {
    const next = this.classOptions.find((option) => option === value);
    if (next !== undefined) {
      this.classFilter.set(next);
    }
  }
}
