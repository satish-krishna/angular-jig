import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero';
import { HeroService } from '../domain/hero.service';
import { rosterRowOf, type RosterRow } from '../ui/hero-display';

const ALL_CLASSES = 'all';

export type ClassFilter = PowerClass | typeof ALL_CLASSES;

// Roster state: the search text, the class filter, and the filtered rows sorted by power.
// The search text starts from the ?q= the top bar sends, so a search from anywhere lands here filtered.
// Component-scoped, provided by Heroes.
@Injectable()
export class HeroesViewModel {
  private readonly heroService = inject(HeroService);

  private readonly routeQuery = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>(ALL_CLASSES);
  readonly classOptions: readonly ClassFilter[] = [ALL_CLASSES, ...POWER_CLASSES];
  readonly total = computed(() => this.heroService.heroes().length);

  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return [...this.heroService.heroes()]
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter((hero) => needle === '' || this.matches(hero, needle))
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map(rosterRowOf);
  });

  readonly classLabel = (value: ClassFilter): string => (value === ALL_CLASSES ? 'All classes' : value);

  setQuery(value: string): void {
    this.query.set(value);
  }

  setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? ALL_CLASSES);
  }

  private matches(hero: Hero, needle: string): boolean {
    return [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle));
  }
}
