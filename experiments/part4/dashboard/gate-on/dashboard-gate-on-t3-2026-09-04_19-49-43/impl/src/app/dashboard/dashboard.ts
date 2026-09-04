import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmInput } from '@spartan-ng/helm/input';
import { HeroService } from '../heroes/hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, HlmInput],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Dashboard</h1>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Hero Search</h2>
        <input
          hlmInput
          type="text"
          placeholder="Search heroes..."
          [value]="searchInput()"
          (input)="onSearchInput($event)"
        />

        @if (filteredHeroes().length > 0) {
          <ul class="mt-4 max-w-md border border-border rounded-md bg-card divide-y divide-border">
            @for (hero of filteredHeroes(); track hero.id) {
              <li class="p-2 hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <a [routerLink]="['/detail', hero.id]" class="block">
                  {{ hero.name }}
                </a>
              </li>
            }
          </ul>
        }
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Top Heroes</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (hero of topHeroes(); track hero.id) {
            <a [routerLink]="['/detail', hero.id]">
              <div class="p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:bg-secondary transition-all cursor-pointer">
                <h3 class="text-lg font-semibold">{{ hero.name }}</h3>
                <p class="text-sm text-muted-foreground mt-2">ID: {{ hero.id }}</p>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
})
export class Dashboard {
  private readonly heroService = inject(HeroService);

  searchInput = signal('');

  private heroes = signal(this.heroService.getHeroes());

  filteredHeroes = computed(() => {
    const search = this.searchInput().toLowerCase().trim();
    if (!search) {
      return [];
    }
    return this.heroes().filter(h => h.name.toLowerCase().includes(search));
  });

  topHeroes = computed(() => {
    return this.heroes().slice(0, 4);
  });

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchInput.set(input.value);
  }
}
