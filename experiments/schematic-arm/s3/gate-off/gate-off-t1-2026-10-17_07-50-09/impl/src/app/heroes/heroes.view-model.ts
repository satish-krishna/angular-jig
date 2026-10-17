import { computed, Injectable, inject, signal } from '@angular/core';
import { POWER_CLASSES } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { toHeroRow, type HeroRow } from '../ui/hero-display';

export interface ClassOption {
  readonly value: string;
  readonly label: string;
}

const ALL_CLASSES = 'all';

@Injectable() // no providedIn: scoped to the Heroes component that provides it
export class HeroesViewModel {
  private readonly heroService = inject(HeroService);

  private readonly query = signal('');
  readonly powerClass = signal(ALL_CLASSES);

  readonly classOptions: readonly ClassOption[] = [
    { value: ALL_CLASSES, label: 'All classes' },
    ...POWER_CLASSES.map((powerClass) => ({ value: powerClass, label: powerClass })),
  ];

  readonly total = computed(() => this.heroService.list().length);

  // Filtered by the search text and class, sorted by power (highest first).
  readonly rows = computed<readonly HeroRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.powerClass();

    return this.heroService
      .list()
      .filter((hero) => powerClass === ALL_CLASSES || hero.powerClass === powerClass)
      .filter(
        (hero) =>
          needle === '' ||
          [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle)),
      )
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map(toHeroRow);
  });

  classLabel = (value: string): string =>
    this.classOptions.find((option) => option.value === value)?.label ?? '';

  setQuery(query: string): void {
    this.query.set(query);
  }

  setPowerClass(value: string | null | undefined): void {
    this.powerClass.set(value ?? ALL_CLASSES);
  }
}
