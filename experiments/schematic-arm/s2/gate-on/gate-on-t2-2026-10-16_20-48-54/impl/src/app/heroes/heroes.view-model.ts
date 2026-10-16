import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero';
import { initialsOf } from '../domain/initials';

/** The class filter's options: every power class, or no class restriction. */
export type ClassFilter = PowerClass | 'All';

/** One roster row: the hero plus the avatar fallback computed for it. */
export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
}

/** The select emits whatever value it was given, so narrow it before storing. */
function isClassFilter(value: unknown): value is ClassFilter {
  return value === 'All' || POWER_CLASSES.some((powerClass) => powerClass === value);
}

@Injectable()
export class HeroesViewModel {
  private readonly heroes = inject(HeroService);

  readonly classOptions: readonly ClassFilter[] = ['All', ...POWER_CLASSES];

  private readonly route = inject(ActivatedRoute);

  /** The topbar search arrives as ?q=. The search box can change the term from there. */
  private readonly routeQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { requireSync: true },
  );
  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>('All');

  readonly totalCount = computed(() => this.heroes.heroes().length);

  /** Heroes matching the search and class filter, strongest first. */
  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();

    return this.heroes
      .heroes()
      .filter((hero) => powerClass === 'All' || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          needle === '' ||
          hero.name.toLowerCase().includes(needle) ||
          hero.alias.toLowerCase().includes(needle) ||
          hero.id.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({ hero, initials: initialsOf(hero.name) }));
  });

  readonly visibleCount = computed(() => this.rows().length);

  setSearch(value: string): void {
    this.query.set(value);
  }

  setClassFilter(value: unknown): void {
    if (isClassFilter(value)) {
      this.classFilter.set(value);
    }
  }
}
