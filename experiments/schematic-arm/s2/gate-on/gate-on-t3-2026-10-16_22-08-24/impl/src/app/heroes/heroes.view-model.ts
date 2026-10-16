import { Injectable, computed, inject, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { initialsOf, type BadgeVariant, STATUS_BADGE } from '../ui/hero-badges';

/** The class filter's "no filter" choice. */
export const ALL_CLASSES = 'all';
export type ClassFilter = PowerClass | typeof ALL_CLASSES;

export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: BadgeVariant;
}

@Injectable()
export class HeroesViewModel {
  private readonly heroService = inject(HeroService);

  /** The class filter's choices, the "all" choice first. */
  readonly classOptions: readonly { readonly value: ClassFilter; readonly label: string }[] = [
    { value: ALL_CLASSES, label: 'All classes' },
    ...POWER_CLASSES.map((powerClass) => ({ value: powerClass, label: powerClass })),
  ];

  readonly query = signal('');
  readonly classFilter = signal<ClassFilter>(ALL_CLASSES);

  /** Heroes that pass both filters, strongest first. */
  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const classFilter = this.classFilter();

    return this.heroService
      .heroes()
      .filter((hero) => classFilter === ALL_CLASSES || hero.powerClass === classFilter)
      .filter((hero) => !needle || [hero.name, hero.alias, hero.id].some((text) => text.toLowerCase().includes(needle)))
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({ hero, initials: initialsOf(hero.alias), statusVariant: STATUS_BADGE[hero.status] }));
  });

  /** Heroes on the roster, before any filter. */
  readonly total = computed(() => this.heroService.heroes().length);

  /** Heroes left after filtering. */
  readonly visibleCount = computed(() => this.rows().length);

  setQuery(text: string): void {
    this.query.set(text);
  }

  /** The select can clear to null or undefined; a cleared select means no filter. */
  setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? ALL_CLASSES);
  }
}
