import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { clearanceLabel, POWER_CLASSES, type Hero, type PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';
import { initialsOf, STATUS_BADGE, type StatusBadge } from '../ui/hero-presentation';

export type ClassFilter = PowerClass | 'all';

export interface ClassOption {
  readonly value: ClassFilter;
  readonly label: string;
}

export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusBadge: StatusBadge;
  readonly clearance: string;
}

// The roster's filtering, ordering and summary, no DOM. Component-scoped (no providedIn):
// the Heroes component provides it, so each visit to the screen starts with a clear filter.
@Injectable()
export class HeroesViewModel {
  private readonly heroes = inject(HeroService).heroes;

  // The topbar search lands here as ?q=TERM. The router reuses this component when only the
  // query changes, so the term is a stream, not a snapshot.
  private readonly routeQuery = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { requireSync: true },
  );

  readonly query = linkedSignal(() => this.routeQuery());
  readonly classFilter = signal<ClassFilter>('all');

  readonly classOptions: readonly ClassOption[] = [
    { value: 'all', label: 'All classes' },
    ...POWER_CLASSES.map((powerClass) => ({ value: powerClass, label: powerClass })),
  ];

  readonly total = computed(() => this.heroes().length);

  // Strongest first: the summary footer promises "sorted by power".
  readonly rows = computed<readonly RosterRow[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const powerClass = this.classFilter();
    return this.heroes()
      .filter((hero) => powerClass === 'all' || hero.powerClass === powerClass)
      .filter((hero) => matchesQuery(hero, needle))
      .sort((a, b) => b.powerIndex - a.powerIndex)
      .map((hero) => ({
        hero,
        initials: initialsOf(hero.name),
        statusBadge: STATUS_BADGE[hero.status],
        clearance: clearanceLabel(hero.clearanceTier),
      }));
  });

  readonly visibleCount = computed(() => this.rows().length);

  setQuery(value: string): void {
    this.query.set(value);
  }

  // The select reports null or undefined when nothing is chosen; that means no class filter.
  setClass(value: ClassFilter | null | undefined): void {
    this.classFilter.set(value ?? 'all');
  }
}

// Matches the name, alias or roster id, case-insensitively. An empty needle matches everyone.
function matchesQuery(hero: Hero, needle: string): boolean {
  if (!needle) {
    return true;
  }
  return [hero.name, hero.alias, hero.id].some((field) => field.toLowerCase().includes(needle));
}
