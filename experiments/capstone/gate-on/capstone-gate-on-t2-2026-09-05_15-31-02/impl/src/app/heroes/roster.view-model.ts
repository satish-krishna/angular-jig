import { Injectable, inject, computed, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import type { PowerClass } from '../domain/hero';

@Injectable()
export class RosterViewModel {
  private readonly heroService = inject(HeroService);
  readonly heroes = this.heroService.heroes;

  readonly searchQuery = signal('');
  readonly selectedClass = signal<PowerClass | 'all'>('all');

  readonly filteredHeroes = computed(() => {
    let result = [...this.heroes()];
    const query = this.searchQuery().toLowerCase();
    const classFilter = this.selectedClass();

    if (query) {
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.alias.toLowerCase().includes(query) ||
          h.id.toLowerCase().includes(query),
      );
    }

    if (classFilter !== 'all') {
      result = result.filter((h) => h.powerClass === classFilter);
    }

    return result;
  });

  readonly sortedHeroes = computed(() =>
    [...this.filteredHeroes()].sort((a, b) => b.powerIndex - a.powerIndex),
  );

  readonly availableClasses = computed(() => {
    const classes = new Set(this.heroes().map((h) => h.powerClass));
    return Array.from(classes).sort();
  });

  readonly heroCount = computed(() => this.sortedHeroes().length);
}
