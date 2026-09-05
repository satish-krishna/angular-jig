import { Injectable, inject, computed, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { Hero } from '../domain/hero.model';

@Injectable()
export class RosterViewModel {
  private heroService = inject(HeroService);

  private searchSignal = signal<string>('');
  private classFilterSignal = signal<string>('');
  private sortBySignal = signal<'power' | 'name'>('power');

  heroes = this.heroService.all;
  heroCount = this.heroService.count;

  filteredHeroes = computed(() => {
    const search = this.searchSignal().toLowerCase();
    const classFilter = this.classFilterSignal();
    let results = [...this.heroes()];

    if (search) {
      results = results.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          h.alias.toLowerCase().includes(search) ||
          h.id.toLowerCase().includes(search)
      );
    }

    if (classFilter) {
      results = results.filter((h) => h.powerClass === classFilter);
    }

    if (this.sortBySignal() === 'power') {
      results.sort((a, b) => b.powerIndex - a.powerIndex);
    } else {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  });

  visibleCount = computed(() => this.filteredHeroes().length);
  totalCount = computed(() => this.heroCount());

  powerClasses = computed(() => {
    const classes = new Set(this.heroes().map((h) => h.powerClass));
    return Array.from(classes).sort();
  });

  setSearch(value: string): void {
    this.searchSignal.set(value);
  }

  setClassFilter(value: string): void {
    this.classFilterSignal.set(value);
  }

  getHeroById(id: string): Hero | undefined {
    return this.heroService.byId(id);
  }

  retire(id: string): void {
    this.heroService.retire(id);
  }
}
