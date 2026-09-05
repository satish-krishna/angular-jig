import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import type { PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class RosterViewModel {
  private readonly heroService = inject(HeroService);

  readonly searchQuery = signal<string>('');
  readonly selectedClass = signal<PowerClass | 'All'>('All');
  readonly sortBy = signal<'power' | 'name'>('power');

  readonly heroes = this.heroService.heroes;

  readonly filteredHeroes = computed(() => {
    let result = this.heroes();
    const query = this.searchQuery().toLowerCase();
    const classFilter = this.selectedClass();

    if (query) {
      result = result.filter(h =>
        h.name.toLowerCase().includes(query) ||
        h.alias.toLowerCase().includes(query) ||
        h.id.toLowerCase().includes(query)
      );
    }

    if (classFilter !== 'All') {
      result = result.filter(h => h.powerClass === classFilter);
    }

    if (this.sortBy() === 'power') {
      result = result.sort((a, b) => b.powerIndex - a.powerIndex);
    } else {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  });

  readonly heroCount = computed(() => this.filteredHeroes().length);
  readonly totalHeroes = computed(() => this.heroes().length);

  readonly powerClasses = computed(() => {
    const classes = new Set(this.heroes().map(h => h.powerClass));
    return Array.from(classes).sort();
  });

  updateSearch(query: string): void {
    this.searchQuery.set(query);
  }

  updateClassFilter(powerClass: PowerClass | 'All'): void {
    this.selectedClass.set(powerClass);
  }

  updateSortBy(sortBy: 'power' | 'name'): void {
    this.sortBy.set(sortBy);
  }
}
