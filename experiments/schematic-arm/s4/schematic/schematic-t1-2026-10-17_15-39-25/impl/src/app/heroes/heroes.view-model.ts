import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HeroService } from '../domain/hero.service';
import type { HeroPowerClass } from '../domain/hero.model';
import { rosterRows, type RosterRow } from '../domain/hero-display';

export const ALL_CLASSES = 'all';
export type ClassFilter = typeof ALL_CLASSES | HeroPowerClass;

export interface ClassOption {
  readonly value: ClassFilter;
  readonly label: string;
}

const POWER_CLASSES: readonly HeroPowerClass[] = [
  'Aerial',
  'Energy',
  'Psionic',
  'Tech',
  'Mutant',
  'Cosmic',
  'Enhanced',
];

// The roster's state and derivations: search, class filter, and the sorted rows. Component-scoped, no DOM.
@Injectable()
export class HeroesViewModel {
  private readonly heroes = inject(HeroService).heroes;
  // The shell's search hands off as ?q=..., so the box starts from the URL and the query follows it.
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  readonly search = linkedSignal(() => this.params().get('q') ?? '');
  private readonly classFilter = signal<ClassFilter>(ALL_CLASSES);

  // "All classes" is no selection at all, so the select shows its placeholder rather than the raw value.
  readonly selectedClass = computed(() => (this.classFilter() === ALL_CLASSES ? null : this.classFilter()));

  readonly classOptions: readonly ClassOption[] = [
    { value: ALL_CLASSES, label: 'All classes' },
    ...POWER_CLASSES.map((value) => ({ value, label: value })),
  ];

  readonly total = computed(() => this.heroes().length);

  readonly rows = computed<readonly RosterRow[]>(() => {
    const term = this.search().trim().toLowerCase();
    const powerClass = this.classFilter();
    return rosterRows(
      this.heroes().filter(
        (hero) =>
          (powerClass === ALL_CLASSES || hero.powerClass === powerClass) &&
          (!term ||
            hero.name.toLowerCase().includes(term) ||
            hero.alias.toLowerCase().includes(term)),
      ),
    );
  });

  readonly matched = computed(() => this.rows().length);

  setSearch(term: string): void {
    this.search.set(term);
  }

  // hlm-select emits its value untyped, so accept only a known option and ignore anything else.
  setClassFilter(value: unknown): void {
    const option = this.classOptions.find((item) => item.value === value);
    if (option) {
      this.classFilter.set(option.value);
    }
  }
}
