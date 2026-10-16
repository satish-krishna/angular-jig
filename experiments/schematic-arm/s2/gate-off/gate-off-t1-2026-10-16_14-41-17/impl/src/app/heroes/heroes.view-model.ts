import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero';
import { initialsOf } from '../domain/initials';

/** The class filter's value: every class, or one of them. */
export type ClassFilter = 'All' | PowerClass;

/**
 * State for the roster screen: the search and class filters, and the filtered,
 * power-sorted list the table shows. Component-scoped, so it dies with the screen.
 */
@Injectable()
export class HeroesViewModel {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);

  /** Class filter options, with "All" first. */
  readonly classOptions: readonly ClassFilter[] = ['All', ...POWER_CLASSES];

  readonly query = signal('');
  readonly classFilter = signal<ClassFilter>('All');

  readonly totalCount = computed(() => this.heroService.heroes().length);

  /** The roster after both filters, strongest power index first. */
  readonly visibleHeroes = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this.heroService
      .heroes()
      .filter((hero) => powerClass === 'All' || hero.powerClass === powerClass)
      .filter((hero) => needle === '' || [hero.name, hero.alias, hero.id].some((text) => text.toLowerCase().includes(needle)))
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** Opens a hero's dossier. */
  openDossier(id: string): void {
    void this.router.navigate(['/detail', id]);
  }

  initials(hero: Hero): string {
    return initialsOf(hero.name);
  }
}
