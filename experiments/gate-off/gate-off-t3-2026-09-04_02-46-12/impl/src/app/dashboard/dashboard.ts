import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroService, type Hero } from '../services/hero.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="dashboard-container">
      <h1>Tour of Heroes Dashboard</h1>

      <div class="search-section">
        <h2>Hero Search</h2>
        <input
          type="text"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Search for a hero..."
          class="search-input"
        />
        @if (searchQuery() && searchResults().length > 0) {
          <ul class="search-results">
            @for (hero of searchResults(); track hero.id) {
              <li>
                <a [routerLink]="['/detail', hero.id]" class="search-result-link">
                  {{ hero.name }}
                </a>
              </li>
            }
          </ul>
        } @else if (searchQuery() && searchResults().length === 0) {
          <p class="no-results">No heroes found matching "{{ searchQuery() }}"</p>
        }
      </div>

      <div class="top-heroes-section">
        <h2>Top Heroes</h2>
        <div class="heroes-grid">
          @for (hero of topHeroes(); track hero.id) {
            <div class="hero-card">
              <a [routerLink]="['/detail', hero.id]" class="card-link">
                <div class="card-content">
                  <h3>{{ hero.name }}</h3>
                  <p class="hero-id">ID: {{ hero.id }}</p>
                </div>
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    h2 {
      margin-bottom: 1rem;
      color: #555;
      font-size: 1.25rem;
    }

    .search-section {
      margin-bottom: 3rem;
    }

    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 0.75rem;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .search-results {
      list-style: none;
      padding: 0;
      margin: 1rem 0 0 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #f9f9f9;
      max-width: 400px;
    }

    .search-results li {
      padding: 0;
      border-bottom: 1px solid #eee;
    }

    .search-results li:last-child {
      border-bottom: none;
    }

    .search-result-link {
      display: block;
      padding: 0.75rem 1rem;
      color: #0066cc;
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .search-result-link:hover {
      background-color: #e6f0ff;
    }

    .search-result-link:focus {
      outline: 2px solid #0066cc;
      outline-offset: -2px;
    }

    .no-results {
      margin-top: 1rem;
      color: #999;
      font-size: 0.95rem;
    }

    .top-heroes-section {
      margin-bottom: 2rem;
    }

    .heroes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      max-width: 1000px;
    }

    .hero-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hero-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .card-link {
      display: block;
      color: inherit;
      text-decoration: none;
      padding: 1.5rem;
      height: 100%;
      background-color: #f5f5f5;
      transition: background-color 0.2s;
    }

    .card-link:hover {
      background-color: #efefef;
    }

    .card-link:focus {
      outline: 2px solid #0066cc;
      outline-offset: -2px;
    }

    .card-content {
      text-align: center;
    }

    .card-content h3 {
      margin: 0 0 0.5rem 0;
      color: #0066cc;
      font-size: 1.25rem;
    }

    .hero-id {
      margin: 0;
      color: #999;
      font-size: 0.9rem;
    }
  `,
})
export class Dashboard {
  searchQuery = signal('');
  topHeroes = signal<Hero[]>([]);
  searchResults = computed(() => this.heroService.searchHeroes(this.searchQuery()));

  constructor(private heroService: HeroService) {
    this.topHeroes.set(this.heroService.getTopHeroes(4));
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }
}

