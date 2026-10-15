import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { HERO_STATUS_BADGE, initialsOf, type StatusBadge } from '../ui/hero-format';

/** The class filter's value: every class, or one of them. */
export type ClassFilter = PowerClass | 'all';

/** A hero as one roster row: the record plus the display values the table needs. */
export interface RosterRow extends Hero {
  readonly initials: string;
  readonly statusVariant: StatusBadge;
}

function isClassFilter(value: string): value is ClassFilter {
  return value === 'all' || (POWER_CLASSES as readonly string[]).includes(value);
}

// Owns the roster's filter state and the derived rows. Component-scoped (provided by Roster), so no providedIn.
@Injectable()
export class RosterViewModel {
  private readonly heroes = inject(HeroService);
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly classFilter = signal<ClassFilter>('all');

  readonly total = this.heroes.count;

  readonly classOptions: readonly { readonly value: ClassFilter; readonly label: string }[] = [
    { value: 'all', label: 'All classes' },
    ...POWER_CLASSES.map((value) => ({ value, label: value })),
  ];

  /** Turns a class filter value into its label, for the select trigger. */
  readonly classLabel = (value: string): string =>
    this.classOptions.find((option) => option.value === value)?.label ?? '';

  /** Matching heroes, strongest first. Search covers name, alias and ID. */
  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this.heroes
      .list()
      .filter(
        (hero) =>
          (powerClass === 'all' || hero.powerClass === powerClass) &&
          (needle === '' || [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle))),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({
        ...hero,
        initials: initialsOf(hero.name),
        statusVariant: HERO_STATUS_BADGE[hero.status],
      }));
  });

  setQuery(value: string): void {
    this.query.set(value);
  }

  setClassFilter(value: string | null | undefined): void {
    if (value && isClassFilter(value)) {
      this.classFilter.set(value);
    }
  }

  openHero(hero: RosterRow): void {
    void this.router.navigate(['detail', hero.id]);
  }
}
