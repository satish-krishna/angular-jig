import { Injectable, computed, inject, signal } from '@angular/core';
import type { PowerClass } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class RosterViewModel {
  private readonly heroService = inject(HeroService);

  private readonly searchTerm = signal('');
  private readonly selectedClass = signal<PowerClass | ''>('');
  private readonly sortBy = signal<'power' | 'name'>('power');

  readonly searchInput = this.searchTerm;
  readonly classFilter = this.selectedClass;

  readonly filteredHeroes = computed(() => {
    const heroes = this.heroService.heroList();
    const search = this.searchTerm().toLowerCase();
    const classFilter = this.selectedClass();

    return heroes
      .filter((hero) => {
        const matchesSearch =
          hero.name.toLowerCase().includes(search) ||
          hero.alias.toLowerCase().includes(search) ||
          hero.id.toLowerCase().includes(search);
        const matchesClass = !classFilter || hero.powerClass === classFilter;
        return matchesSearch && matchesClass;
      })
      .sort((a, b) => {
        if (this.sortBy() === 'power') {
          return b.powerIndex - a.powerIndex;
        }
        return a.name.localeCompare(b.name);
      });
  });

  readonly heroCount = computed(() => this.filteredHeroes().length);
  readonly totalCount = computed(() => this.heroService.heroCount());

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setClassFilter(value: PowerClass | ''): void {
    this.selectedClass.set(value);
  }

  setSortBy(value: 'power' | 'name'): void {
    this.sortBy.set(value);
  }

  deleteHero(id: string): void {
    this.heroService.removeHero(id);
  }
}
