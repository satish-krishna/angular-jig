import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { type Hero, POWER_CLASSES, type PowerClass } from '../domain/hero.model';
import { heroInitials, type HeroStatusVariant, STATUS_VARIANT } from '../domain/hero.presentation';
import { HeroService } from '../domain/hero.service';

export type ClassFilter = 'All' | PowerClass;

export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: HeroStatusVariant;
}

const CLASS_OPTIONS: readonly ClassFilter[] = ['All', ...POWER_CLASSES];

// Roster state and logic: the search text, the class filter, and the sorted rows the table shows.
// Component-scoped: the component provides it, so each visit starts with an empty filter.
@Injectable()
export class RosterViewModel {
  private readonly _heroes = inject(HeroService);
  private readonly _router = inject(Router);
  private readonly _query = signal('');

  public readonly classOptions = CLASS_OPTIONS;
  public readonly classFilter = signal<ClassFilter>('All');
  public readonly totalCount = this._heroes.count;

  // Filtered by name or alias and by class, then sorted by power index, strongest first.
  public readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this._query().trim().toLowerCase();
    const classFilter = this.classFilter();

    const matches = this._heroes
      .heroes()
      .filter((hero) => classFilter === 'All' || hero.powerClass === classFilter)
      .filter((hero) => !needle || `${hero.name} ${hero.alias}`.toLowerCase().includes(needle));

    return [...matches]
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({ hero, initials: heroInitials(hero.name), statusVariant: STATUS_VARIANT[hero.status] }));
  });

  public readonly visibleCount = computed(() => this.rows().length);

  public setQuery(value: string): void {
    this._query.set(value);
  }

  // The select reports nothing when it is cleared; fall back to showing every class.
  public setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? 'All');
  }

  public openHero(hero: Hero): void {
    void this._router.navigate(['/detail', hero.id]);
  }
}
