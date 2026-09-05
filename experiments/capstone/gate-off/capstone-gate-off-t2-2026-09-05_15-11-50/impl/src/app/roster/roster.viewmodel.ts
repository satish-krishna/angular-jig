import { Injectable, inject, computed, signal } from '@angular/core';
import { HeroService } from '../domain/hero.service';

@Injectable()
export class RosterViewModel {
  private heroService = inject(HeroService);

  private searchSignal = signal<string>('');
  private classFilterSignal = signal<string>('');

  heroes = this.heroService.heroes$;

  powerClasses = computed(() => {
    const classes = new Set(this.heroes().map((h) => h.powerClass));
    return Array.from(classes).sort();
  });

  filteredAndSortedHeroes = computed(() => {
    const search = this.searchSignal().toLowerCase();
    const classFilter = this.classFilterSignal();

    return this.heroes()
      .filter((hero) => {
        const matchesSearch =
          hero.name.toLowerCase().includes(search) ||
          hero.alias.toLowerCase().includes(search) ||
          hero.id.toLowerCase().includes(search);

        const matchesClass = !classFilter || hero.powerClass === classFilter;

        return matchesSearch && matchesClass;
      })
      .sort((a, b) => b.powerIndex - a.powerIndex);
  });

  heroCount = computed(() => this.filteredAndSortedHeroes().length);

  updateSearch(term: string): void {
    this.searchSignal.set(term);
  }

  updateClassFilter(powerClass: string): void {
    this.classFilterSignal.set(powerClass);
  }
}
