import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroService } from '../heroes/hero.service';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HlmInput, HlmCardImports],
  template: `
    <div class="p-5 max-w-screen-xl">
      <h1 class="text-3xl font-bold mb-7 text-foreground">Tour of Heroes</h1>

      <div class="mb-10">
        <h2 class="text-xl font-semibold mb-4 text-foreground">Hero Search</h2>
        <div class="mb-3">
          <input
            hlmInput
            type="text"
            placeholder="Search heroes..."
            [value]="searchTerm()"
            (input)="onSearchChange($event)"
            class="max-w-xs"
          />
        </div>
        @if (searchTerm() && searchResults().length > 0) {
          <ul class="mt-3 bg-background border border-border rounded-md max-w-xs max-h-80 overflow-y-auto">
            @for (hero of searchResults(); track hero.id) {
              <li class="border-b border-border last:border-b-0">
                <a
                  [routerLink]="['/detail', hero.id]"
                  class="dashboard-result-link block py-2 px-3 text-primary no-underline hover:bg-muted hover:underline transition-colors"
                  (click)="searchTerm.set('')"
                >
                  {{ hero.name }}
                </a>
              </li>
            }
          </ul>
        }
        @if (searchTerm() && searchResults().length === 0) {
          <p class="text-muted-foreground text-sm mt-3">No heroes found</p>
        }
      </div>

      <div class="mt-10">
        <h2 class="text-xl font-semibold mb-4 text-foreground">Top Heroes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (hero of topHeroes(); track hero.id) {
            <hlm-card class="dashboard-card">
              <hlm-card-header>
                <h4 hlmCardTitle>
                  <a [routerLink]="['/detail', hero.id]" class="dashboard-hero-link">
                    {{ hero.name }}
                  </a>
                </h4>
              </hlm-card-header>
            </hlm-card>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchTerm = signal('');
  topHeroes = computed(() => this.heroService.getTopHeroes(4));
  searchResults = computed(() => this.heroService.searchHeroes(this.searchTerm()));

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}

