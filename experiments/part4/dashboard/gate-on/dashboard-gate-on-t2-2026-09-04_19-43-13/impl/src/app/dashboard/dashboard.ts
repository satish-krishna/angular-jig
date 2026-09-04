import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmInput } from '@spartan-ng/helm/input';
import { HeroesService, Hero } from '../heroes.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, HlmInput],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-8">Dashboard</h1>

      <div class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Hero Search</h2>
        <div class="max-w-md">
          <input
            hlmInput
            type="text"
            placeholder="Hero name"
            [value]="searchTerm()"
            (input)="onSearchChange($event.target?.value || '')"
          />

          @if (searchResults().length > 0) {
            <ul class="search-results mt-4">
              @for (hero of searchResults() | slice: 0: 10; track hero.id) {
                <li>
                  <a [routerLink]="['/detail', hero.id]" class="px-4 py-3 block">{{ hero.name }}</a>
                </li>
              }
            </ul>
          }
        </div>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-6">Top Heroes</h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (hero of topHeroes; track hero.id) {
            <div class="hero-card p-6">
              <h3 class="text-base font-semibold mb-4">{{ hero.name }}</h3>
              <a [routerLink]="['/detail', hero.id]" class="inline-block px-4 py-2 bg-primary text-primary-foreground rounded transition-colors hover:opacity-90">View Details</a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private heroesService = inject(HeroesService);
  topHeroes: Hero[];

  protected readonly searchTerm = signal('');

  searchResults = computed(() =>
    this.heroesService.searchHeroes(this.searchTerm())
  );

  constructor() {
    this.topHeroes = this.heroesService.getTopHeroes(4);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }
}

