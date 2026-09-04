import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroService } from '../hero.service';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, FormsModule, HlmInputImports, HlmCardImports, HlmButtonImports],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="search-section">
        <h2>Hero Search</h2>
        <input
          type="text"
          placeholder="Search by hero name"
          [(ngModel)]="searchQuery"
          hlmInput
        />
        @if (searchResults().length > 0) {
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
        <h2>Top Heroes</h2>
        <div class="heroes-grid">
          @for (hero of topHeroes; track hero.id) {
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>{{ hero.name }}</h3>
              </div>
              <div hlmCardContent>
                <a [routerLink]="['/detail', hero.id]" hlmBtn variant="default">
                  View Details
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: var(--spacing-lg, 2rem);
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: var(--text-primary, #333);
      margin-bottom: var(--spacing-lg, 2rem);
    }

    h2 {
      color: var(--text-secondary, #666);
      margin-bottom: var(--spacing-md, 1rem);
      font-size: 1.25rem;
    }

    .search-section {
      margin-bottom: var(--spacing-xl, 3rem);
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 0.25rem);
      margin-top: var(--spacing-md, 1rem);
      max-width: 400px;
    }

    .search-result-link {
      display: block;
      padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
      background-color: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      color: var(--link-color, #0066cc);
      text-decoration: none;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .search-result-link:hover {
      background-color: var(--bg-hover, #e8e8e8);
      color: var(--link-hover, #0052a3);
    }

    .search-result-link:focus {
      outline: 2px solid var(--border-focus, #0066cc);
      outline-offset: 2px;
    }

    .top-heroes-section {
      margin-top: var(--spacing-xl, 3rem);
    }

    .heroes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md, 1rem);
      max-width: 1000px;
    }
  `,
})
export class Dashboard {
  private heroService = inject(HeroService);

  searchQuery = signal('');
  topHeroes = this.heroService.getTopHeroes(4);
  searchResults = computed(() => this.heroService.searchHeroes(this.searchQuery()));
}
