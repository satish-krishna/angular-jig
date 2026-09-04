import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HeroService, Hero } from '../services/hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, HlmInputImports, HlmButtonImports],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="search-section">
        <h2>Hero Search</h2>
        <input
          type="text"
          hlmInput
          placeholder="Search heroes..."
          (input)="onSearch($event)"
        />
        @if (searchResults().length > 0) {
          <ul class="search-results">
            @for (hero of searchResults(); track hero.id) {
              <li>
                <a [routerLink]="['/detail', hero.id]">{{ hero.name }}</a>
              </li>
            }
          </ul>
        }
      </div>

      <div class="top-heroes-section">
        <h2>Top Heroes</h2>
        <div class="heroes-grid">
          @for (hero of topHeroes(); track hero.id) {
            <div class="hero-card">
              <h3>{{ hero.name }}</h3>
              <a [routerLink]="['/detail', hero.id]" class="hero-link">View Details</a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .search-section {
      margin-bottom: 40px;
    }

    .search-results {
      list-style: none;
      padding: 10px 0;
      margin: 10px 0;
      max-width: 400px;
    }

    .search-results li {
      padding: 8px;
      border-bottom: 1px solid var(--border);
    }

    .search-results a {
      color: var(--primary);
      text-decoration: none;
      cursor: pointer;
    }

    .search-results a:hover {
      text-decoration: underline;
    }

    .top-heroes-section {
      margin-top: 40px;
    }

    .heroes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .hero-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: var(--card);
    }

    .hero-card h3 {
      margin: 0 0 15px 0;
      color: var(--foreground);
    }

    .hero-link {
      display: inline-block;
      color: var(--primary);
      text-decoration: none;
      border: 1px solid var(--primary);
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .hero-link:hover {
      background-color: var(--primary);
      color: var(--primary-foreground);
    }
  `]
})
export class Dashboard {
  private heroService = inject(HeroService);
  searchTerm = signal('');
  topHeroes = signal<Hero[]>([]);
  searchResults = computed(() => {
    const term = this.searchTerm();
    return term.trim() ? this.heroService.searchHeroes(term) : [];
  });

  constructor() {
    this.topHeroes.set(this.heroService.getTopHeroes(4));
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
