import { Injectable, inject, signal, computed } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { PowerClass } from '../domain/hero.model';

@Injectable()
export class RosterViewModel {
  private readonly heroService = inject(HeroService);

  readonly searchQuery = signal<string>('');
  readonly selectedClass = signal<PowerClass | 'all'>('all');

  readonly filteredHeroes = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const classFilter = this.selectedClass();
    const heroes = this.heroService.heroes();

    return heroes
      .filter((hero) => {
        const matchesQuery =
          query === '' ||
          hero.name.toLowerCase().includes(query) ||
          hero.alias.toLowerCase().includes(query) ||
          hero.id.includes(query);

        const matchesClass = classFilter === 'all' || hero.powerClass === classFilter;

        return matchesQuery && matchesClass;
      })
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  readonly totalHeroes = computed(() => this.heroService.heroes().length);
  readonly filteredCount = computed(() => this.filteredHeroes().length);

  readonly powerClasses = computed(() => {
    const unique = new Set(this.heroService.heroes().map((h) => h.powerClass));
    return Array.from(unique).sort();
  });

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSelectedClass(powerClass: PowerClass | 'all'): void {
    this.selectedClass.set(powerClass);
  }
}
