import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroService, Hero } from '../hero.service';
import { HlmInput } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, HlmInput],
  template: `
    <h1>Dashboard</h1>

    <div class="mb-8">
      <label for="hero-search" class="block mb-2 font-bold">Hero Search:</label>
      <input
        hlmInput
        id="hero-search"
        type="text"
        placeholder="Search heroes..."
        (input)="onSearchChange($event)"
      />

      @if (searchResults().length > 0) {
        <ul class="mt-2 border rounded-md max-w-xs">
          @for (hero of searchResults(); track hero.id) {
            <li class="px-4 py-2 border-b last:border-b-0">
              <a [routerLink]="['/detail', hero.id]" class="text-blue-600 hover:underline">
                {{ hero.name }}
              </a>
            </li>
          }
        </ul>
      }
    </div>

    <h2 class="text-xl font-bold mb-4">Top Heroes</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      @for (hero of topHeroes; track hero.id) {
        <div class="border rounded-lg p-4 bg-gray-50">
          <h3 class="mb-3 font-semibold">{{ hero.name }}</h3>
          <a [routerLink]="['/detail', hero.id]" class="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            View Details
          </a>
        </div>
      }
    </div>
  `,
})
export class Dashboard {
  readonly topHeroes: Hero[];
  readonly searchResults = signal<Hero[]>([]);

  constructor(private heroService: HeroService) {
    this.topHeroes = this.heroService.getTopHeroes(4);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchResults.set(this.heroService.searchHeroes(query));
  }
}
