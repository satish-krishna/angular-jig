import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroService, Hero } from '../hero.service';
import { HlmInput } from '../../../libs/ui/input/src/lib/hlm-input';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, HlmInput],
  template: `
    <div class="grid gap-8 p-8">
      <h1 class="text-4xl font-bold">Dashboard</h1>

      <div class="grid gap-4">
        <h2 class="text-2xl font-semibold">Search Heroes</h2>
        <input
          hlmInput
          type="text"
          [value]="searchTerm()"
          (input)="onSearchInput($event)"
          placeholder="Search heroes by name..."
        />

        @if (searchResults().length > 0) {
          <div class="mt-2 border border-border rounded-lg bg-card">
            <ul class="list-none m-0 p-0">
              @for (hero of searchResults(); track hero.id) {
                <li
                  class="border-b border-border last:border-b-0 px-4 py-2 hover:bg-muted transition-colors"
                >
                  <a
                    [routerLink]="['/detail', hero.id]"
                    class="text-primary hover:underline font-medium"
                  >
                    {{ hero.name }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <div class="grid gap-4">
        <h2 class="text-2xl font-semibold">Top Heroes</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (hero of topHeroes(); track hero.id) {
            <a
              [routerLink]="['/detail', hero.id]"
              class="p-6 border border-border rounded-lg bg-card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div class="font-semibold text-lg text-card-foreground">
                {{ hero.name }}
              </div>
              <div class="text-sm text-muted-foreground mt-2">Hero #{{ hero.id }}</div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchTerm = signal('');

  private allHeroes = signal<Hero[]>(this.heroService.getHeroes());

  topHeroes = computed(() => this.allHeroes().slice(0, 4));

  searchResults = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return [];
    return this.allHeroes().filter((h) => h.name.toLowerCase().includes(term));
  });

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }
}
