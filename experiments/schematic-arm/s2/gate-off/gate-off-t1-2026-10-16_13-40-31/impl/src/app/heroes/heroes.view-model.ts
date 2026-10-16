import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type PowerClass } from '../domain/hero.model';

/** The class-filter value that shows every power class. */
export const ALL_CLASSES = 'all';
export type ClassFilter = PowerClass | typeof ALL_CLASSES;

/** Filters and sorts the roster for the table. Component-scoped; no DOM. */
@Injectable()
export class HeroesViewModel {
  private readonly heroes = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  readonly classOptions = POWER_CLASSES;
  readonly powerClass = signal<ClassFilter>(ALL_CLASSES);

  /** The `q` the topbar search sends over. Read as a signal so a reused screen follows it. */
  private readonly urlQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { requireSync: true },
  );

  /** Starts from the URL's search term, then follows what the user types. */
  readonly query = linkedSignal(() => this.urlQuery());

  readonly total = this.heroes.count;

  /** Heroes matching the search and class filter, strongest first. */
  readonly rows = computed(() => {
    const term = this.query().trim().toLowerCase();
    const wanted = this.powerClass();
    return this.heroes
      .list()
      .filter((hero) => wanted === ALL_CLASSES || hero.powerClass === wanted)
      .filter(
        (hero) =>
          term === '' ||
          [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(term)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  setQuery(value: string): void {
    this.query.set(value);
  }

  setPowerClass(value: ClassFilter | null | undefined): void {
    this.powerClass.set(value ?? ALL_CLASSES);
  }

  /** Up to two initials from a hero's name, for the avatar fallback. */
  initialsOf(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }
}
