import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { heroInitials } from '../domain/hero.initials';
import { POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';

export type ClassFilter = PowerClass | 'all';

// Component-scoped (the Heroes component provides it). Owns the roster's filter
// state and the sorted, filtered rows, so the component stays a shell.
@Injectable()
export class HeroesViewModel {
  private readonly heroes = inject(HeroService);
  private readonly route = inject(ActivatedRoute);

  readonly classOptions: readonly { readonly value: ClassFilter; readonly label: string }[] = [
    { value: 'all', label: 'All classes' },
    ...POWER_CLASSES.map((value) => ({ value, label: value })),
  ];

  // The top-bar search arrives as ?q=. Re-emits when only the query changes, because the
  // router reuses this component when the roster is already open.
  private readonly routeQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>('all');

  readonly totalCount = computed(() => this.heroes.roster().length);

  // Strongest first. Sorting a fresh array from filter() leaves the service's roster untouched.
  readonly visible = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this.heroes
      .roster()
      .filter((hero) => powerClass === 'all' || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          needle === '' ||
          [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  readonly visibleCount = computed(() => this.visible().length);

  setQuery(value: string): void {
    this.query.set(value);
  }

  // The select reports null or undefined when nothing is selected; that means no class filter.
  setClassFilter(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? 'all');
  }

  initialsFor(hero: Hero): string {
    return heroInitials(hero.name);
  }
}
