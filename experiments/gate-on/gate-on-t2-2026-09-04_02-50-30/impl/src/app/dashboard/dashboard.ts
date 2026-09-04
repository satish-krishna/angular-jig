import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroService, type Hero } from '../hero.service';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>Tour of Heroes Dashboard</h2>

      <div class="search-section">
        <h3>Hero Search</h3>
        <input
          hlmInput
          type="text"
          placeholder="Search heroes..."
          [value]="searchTerm()"
          (input)="onSearchChange($event)"
        />
        @if (searchTerm() && searchResults().length > 0) {
          <div class="search-results">
            @for (hero of searchResults(); track hero.id) {
              <a [routerLink]="['/detail', hero.id]" class="search-result-link">
                {{ hero.name }}
              </a>
            }
          </div>
        }
      </div>

      <div class="top-heroes-section">
        <h3>Top Heroes</h3>
        <div class="heroes-grid">
          @for (hero of topHeroes(); track hero.id) {
            <hlm-card>
              <hlm-card-header>
                <h4 hlmCardTitle>
                  <a [routerLink]="['/detail', hero.id]">{{ hero.name }}</a>
                </h4>
              </hlm-card-header>
            </hlm-card>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.css',
  imports: [CommonModule, RouterLink, HlmInput, HlmCardImports],
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchTerm = signal('');
  heroes = signal<Hero[]>(this.heroService.getHeroes());

  searchResults = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return [];
    }
    return this.heroes().filter((hero) => hero.name.toLowerCase().includes(term));
  });

  topHeroes = computed(() => {
    return this.heroes().slice(0, 4);
  });

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
